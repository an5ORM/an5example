package main_test

import (
	"context"
	"database/sql"
	"testing"
	"time"

	_ "modernc.org/sqlite"

	an5 "an5client"
)

func setupIncludeTestDB(t *testing.T) (*sql.DB, *an5.An5DbContext) {
	t.Helper()
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	db.SetMaxOpenConns(1)

	ddl := []string{
		`CREATE TABLE users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            score INTEGER NOT NULL DEFAULT 0,
            embedding BLOB,
            created_at DATETIME NOT NULL
        )`,
		`CREATE TABLE orders (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            total INTEGER NOT NULL DEFAULT 0,
            status TEXT,
            created_at DATETIME NOT NULL
        )`,
	}
	for _, stmt := range ddl {
		if _, err := db.Exec(stmt); err != nil {
			t.Fatalf("exec ddl: %v", err)
		}
	}

	client := an5.NewAn5DbContextWithConnStr(db, "sqlite")
	ctx := context.Background()
	now := time.Now().UTC()

	for _, u := range []*an5.User{
		{Id: "u_alice", Email: "alice@example.com", Name: an5.StringPtr("Alice"), IsActive: true, Score: 100, CreatedAt: now},
		{Id: "u_bob", Email: "bob@example.com", Name: an5.StringPtr("Bob"), IsActive: true, Score: 80, CreatedAt: now},
		{Id: "u_carol", Email: "carol@example.com", Name: an5.StringPtr("Carol"), IsActive: false, Score: 50, CreatedAt: now},
	} {
		if _, err := client.User.Create(ctx, u); err != nil {
			t.Fatalf("seed user %s: %v", u.Id, err)
		}
	}
	if _, err := db.Exec("UPDATE users SET is_active = 0 WHERE id = 'u_carol'"); err != nil {
		t.Fatalf("set carol inactive: %v", err)
	}

	for _, o := range []*an5.Order{
		{Id: "o1", UserId: "u_alice", Total: 50, Status: an5.StringPtr("paid"), CreatedAt: now},
		{Id: "o2", UserId: "u_alice", Total: 150, Status: an5.StringPtr("paid"), CreatedAt: now},
		{Id: "o3", UserId: "u_alice", Total: 300, Status: an5.StringPtr("open"), CreatedAt: now},
		{Id: "o4", UserId: "u_bob", Total: 250, Status: an5.StringPtr("paid"), CreatedAt: now},
		{Id: "o5", UserId: "u_bob", Total: 75, Status: an5.StringPtr("cancelled"), CreatedAt: now},
		{Id: "o_orphan", UserId: "u_missing", Total: 99, Status: an5.StringPtr("open"), CreatedAt: now},
	} {
		if _, err := client.Order.Create(ctx, o); err != nil {
			t.Fatalf("seed order %s: %v", o.Id, err)
		}
	}

	return db, client
}

func TestEagerIncludeAndCount(t *testing.T) {
	_, client := setupIncludeTestDB(t)
	ctx := context.Background()

	// 1. To-many eager Include + _count: true (including user with 0 orders).
	users, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		OrderBy: &an5.UserOrderByInput{Id: an5.SortOrderPtr(an5.SortOrderAsc)},
		Include: &an5.UserInclude{
			Orders: true,
			Count:  true,
		},
	})
	if err != nil {
		t.Fatalf("FindMany with UserInclude failed: %v", err)
	}
	if len(users) != 3 {
		t.Fatalf("expected 3 users, got %d", len(users))
	}
	if len(users[0].Orders) != 3 || users[0].Count["orders"] != 3 {
		t.Fatalf("alice expected 3 orders and count=3, got len=%d count=%v", len(users[0].Orders), users[0].Count)
	}
	if len(users[1].Orders) != 2 || users[1].Count["orders"] != 2 {
		t.Fatalf("bob expected 2 orders and count=2, got len=%d count=%v", len(users[1].Orders), users[1].Count)
	}
	if users[2].Orders == nil || len(users[2].Orders) != 0 || users[2].Count["orders"] != 0 {
		t.Fatalf("carol expected non-nil empty Orders and count=0, got orders=%v count=%v", users[2].Orders, users[2].Count)
	}

	// 2. Per-parent Skip/Take, nested Where, OrderBy, and Take=0.
	pagedUsers, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		Where:   &an5.UserWhereInput{IsActive: &an5.BoolFilter{Equals: an5.BoolPtr(true)}},
		OrderBy: &an5.UserOrderByInput{Id: an5.SortOrderPtr(an5.SortOrderAsc)},
		Include: &an5.UserInclude{
			Orders: &an5.OrderFindManyArgs{
				Where:   &an5.OrderWhereInput{Total: &an5.IntFilter{Gte: an5.IntPtr(75)}},
				OrderBy: &an5.OrderOrderByInput{Total: an5.SortOrderPtr(an5.SortOrderDesc)},
				Skip:    an5.IntPtr(1),
				Take:    an5.IntPtr(1),
			},
		},
	})
	if err != nil {
		t.Fatalf("FindMany with per-parent Skip/Take failed: %v", err)
	}
	if len(pagedUsers) != 2 {
		t.Fatalf("expected 2 active users, got %d", len(pagedUsers))
	}
	if len(pagedUsers[0].Orders) != 1 || pagedUsers[0].Orders[0].Id != "o2" {
		t.Fatalf("alice expected skipped 2nd order o2 (150), got %+v", pagedUsers[0].Orders)
	}
	if len(pagedUsers[1].Orders) != 1 || pagedUsers[1].Orders[0].Id != "o5" {
		t.Fatalf("bob expected skipped 2nd order o5 (75), got %+v", pagedUsers[1].Orders)
	}

	zeroTakeUsers, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		Include: &an5.UserInclude{
			Orders: &an5.IncludeOptions{Take: an5.IntPtr(0)},
		},
	})
	if err != nil {
		t.Fatalf("FindMany with nested Take=0 failed: %v", err)
	}
	for _, u := range zeroTakeUsers {
		if u.Orders == nil || len(u.Orders) != 0 {
			t.Fatalf("expected empty slice for Orders with Take=0 on %s, got %+v", u.Id, u.Orders)
		}
	}

	// 3. Parent Select strips injected join key after hydrating Orders and _count.
	projectedUsers, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		Where:  &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr("u_alice")}},
		Select: []string{"email"},
		Include: &an5.UserInclude{
			Orders: &an5.OrderFindManyArgs{
				OrderBy: &an5.OrderOrderByInput{Total: an5.SortOrderPtr(an5.SortOrderDesc)},
				Take:    an5.IntPtr(1),
			},
			Count: true,
		},
	})
	if err != nil {
		t.Fatalf("FindMany with Select+Include failed: %v", err)
	}
	if len(projectedUsers) != 1 || projectedUsers[0].Id != "" || projectedUsers[0].Email != "alice@example.com" {
		t.Fatalf("expected injected id stripped and email retained, got %+v", projectedUsers)
	}
	if len(projectedUsers[0].Orders) != 1 || projectedUsers[0].Orders[0].Id != "o3" || projectedUsers[0].Count["orders"] != 3 {
		t.Fatalf("expected hydrated top order o3 and count=3, got %+v", projectedUsers[0])
	}

	// 4. FindFirst and FindUnique with Select + Include.
	uniqueAlice, err := client.User.FindUnique(ctx, &an5.UserFindUniqueArgs{
		Where:  &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr("u_alice")}},
		Select: []string{"name"},
		Include: &an5.UserInclude{
			Orders: true,
			Count: &an5.CountIncludeOptions{
				Select: map[string]interface{}{
					"orders": map[string]interface{}{
						"where": &an5.OrderWhereInput{Status: &an5.StringFilter{Equals: an5.StringPtr("paid")}},
					},
				},
			},
		},
	})
	if err != nil {
		t.Fatalf("FindUnique with Select+Include failed: %v", err)
	}
	if uniqueAlice == nil || uniqueAlice.Id != "" || uniqueAlice.Name == nil || *uniqueAlice.Name != "Alice" {
		t.Fatalf("unexpected FindUnique projection: %+v", uniqueAlice)
	}
	if len(uniqueAlice.Orders) != 3 || uniqueAlice.Count["orders"] != 2 {
		t.Fatalf("expected 3 orders and filtered paid count=2, got len=%d count=%v", len(uniqueAlice.Orders), uniqueAlice.Count)
	}

	firstBob, err := client.User.FindFirst(ctx, &an5.UserFindFirstArgs{
		Where:   &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr("u_bob")}},
		Include: &an5.UserInclude{Orders: true},
	})
	if err != nil || firstBob == nil || len(firstBob.Orders) != 2 {
		t.Fatalf("FindFirst with Include failed: err=%v user=%+v", err, firstBob)
	}

	// 5. To-one Include (Order -> User) including orphan FK returning nil.
	ordersWithUser, err := client.Order.FindMany(ctx, &an5.OrderFindManyArgs{
		OrderBy: &an5.OrderOrderByInput{Id: an5.SortOrderPtr(an5.SortOrderAsc)},
		Include: &an5.OrderInclude{User: true},
	})
	if err != nil {
		t.Fatalf("Order FindMany with User include failed: %v", err)
	}
	var foundOrphan bool
	for _, o := range ordersWithUser {
		if o.Id == "o_orphan" {
			foundOrphan = true
			if o.User != nil {
				t.Fatalf("expected nil User for orphan order, got %+v", o.User)
			}
		} else if o.User == nil {
			t.Fatalf("expected hydrated User for order %s", o.Id)
		}
	}
	if !foundOrphan {
		t.Fatalf("expected o_orphan row")
	}

	// 6. Recursive nested Include (User -> Orders -> User) with child Select stripping injected FKs + shorthand Include.
	deepUsers, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr("u_alice")}},
		Include: &an5.UserInclude{
			Orders: &an5.OrderFindManyArgs{
				OrderBy: &an5.OrderOrderByInput{Total: an5.SortOrderPtr(an5.SortOrderDesc)},
				Take:    an5.IntPtr(1),
				Select:  []string{"id", "total"},
				Include: &an5.OrderInclude{
					User: &an5.UserFindManyArgs{
						Select: []string{"email"},
					},
				},
			},
		},
	})
	if err != nil {
		t.Fatalf("recursive Include failed: %v", err)
	}
	if len(deepUsers) != 1 || len(deepUsers[0].Orders) != 1 {
		t.Fatalf("expected 1 deep user + 1 order, got %+v", deepUsers)
	}
	topOrder := deepUsers[0].Orders[0]
	if topOrder.Id != "o3" || topOrder.UserId != "" || topOrder.User == nil || topOrder.User.Id != "" || topOrder.User.Email != "alice@example.com" {
		t.Fatalf("expected stripped join keys and hydrated nested User email, got order=%+v user=%+v", topOrder, topOrder.User)
	}

	shorthandUsers, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr("u_bob")}},
		Include: &an5.UserInclude{
			Orders: &an5.OrderInclude{User: true},
		},
	})
	if err != nil || len(shorthandUsers) != 1 || len(shorthandUsers[0].Orders) != 2 || shorthandUsers[0].Orders[0].User == nil || shorthandUsers[0].Orders[0].User.Email != "bob@example.com" {
		t.Fatalf("shorthand nested Include failed: err=%v users=%+v", err, shorthandUsers)
	}

	// 7. Map-based Include & filtered _count with map where.
	mapUsers, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
		OrderBy: &an5.UserOrderByInput{Id: an5.SortOrderPtr(an5.SortOrderAsc)},
		Include: map[string]interface{}{
			"orders": map[string]interface{}{
				"where":   map[string]interface{}{"status": "paid"},
				"orderBy": map[string]interface{}{"total": "asc"},
				"select":  map[string]bool{"id": true, "total": true},
			},
			"_count": map[string]interface{}{
				"select": map[string]interface{}{
					"orders": map[string]interface{}{
						"where": map[string]interface{}{"total": map[string]interface{}{"gte": 200}},
					},
				},
			},
		},
	})
	if err != nil {
		t.Fatalf("map-based Include failed: %v", err)
	}
	if len(mapUsers[0].Orders) != 2 || mapUsers[0].Orders[0].UserId != "" || mapUsers[0].Count["orders"] != 1 || mapUsers[1].Count["orders"] != 1 || mapUsers[2].Count["orders"] != 0 {
		t.Fatalf("unexpected map-based Include results: aliceOrders=%+v counts=(%v, %v, %v)", mapUsers[0].Orders, mapUsers[0].Count, mapUsers[1].Count, mapUsers[2].Count)
	}

	// 8. Strict validation errors on both populated and empty result sets.
	validationCases := []struct {
		name string
		fn   func() error
	}{
		{"unknown relation in Include", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{Include: map[string]interface{}{"unknownRel": true}})
			return err
		}},
		{"unknown relation on empty result set", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Where:   &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr("no_such_user")}},
				Include: map[string]interface{}{"unknownRel": true},
			})
			return err
		}},
		{"unknown relation in _count", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Count: &an5.CountIncludeOptions{Select: map[string]interface{}{"badRel": true}}},
			})
			return err
		}},
		{"to-one relation in _count", func() error {
			_, err := client.Order.FindMany(ctx, &an5.OrderFindManyArgs{
				Include: &an5.OrderInclude{Count: &an5.CountIncludeOptions{Select: map[string]interface{}{"user": true}}},
			})
			return err
		}},
		{"unknown option in nested Include", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Orders: map[string]interface{}{"bogusOpt": true}},
			})
			return err
		}},
		{"unknown option in _count.orders", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Count: map[string]interface{}{"select": map[string]interface{}{"orders": map[string]interface{}{"take": 1}}}},
			})
			return err
		}},
		{"negative take in Include", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Orders: &an5.OrderFindManyArgs{Take: an5.IntPtr(-1)}},
			})
			return err
		}},
		{"negative skip in Include", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Orders: &an5.OrderFindManyArgs{Skip: an5.IntPtr(-2)}},
			})
			return err
		}},
		{"mismatched WhereInput struct in Include", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Orders: &an5.IncludeOptions{Where: &an5.UserWhereInput{}}},
			})
			return err
		}},
		{"mismatched FindManyArgs struct in Include", func() error {
			_, err := client.User.FindMany(ctx, &an5.UserFindManyArgs{
				Include: &an5.UserInclude{Orders: &an5.UserFindManyArgs{}},
			})
			return err
		}},
		{"mismatched Include struct on query", func() error {
			_, err := client.Order.FindMany(ctx, &an5.OrderFindManyArgs{
				Include: &an5.UserInclude{Orders: true},
			})
			return err
		}},
	}
	for _, vc := range validationCases {
		if err := vc.fn(); err == nil {
			t.Fatalf("%s: expected validation error, got nil", vc.name)
		}
	}
}
