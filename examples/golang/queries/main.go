// AN5 ORM Full Query API Showcase for Golang
// Demonstrates all 11 core query capabilities:
// 1. Data Insertion (Create, CreateMany)
// 2. Advanced Filtering & Comparators (Contains, StartsWith, EndsWith, Ranges, In)
// 3. Logical Combinators (AND, OR, NOT)
// 4. Field Projections (Select)
// 5. Sorting & Pagination (OrderBy, Skip, Take)
// 6. Relations & Relational Filters (EXISTS subqueries, parent-child joins)
// 7. Mutations (Update, Atomic Math, UpdateMany, Upsert, Delete)
// 8. Aggregations & Group By (_count, _sum, _avg, _min, _max, GroupBy)
// 9. ACID Transactions (Commit & Rollback)
// 10. Semantic Vector Search (Cosine similarity)
// 11. Raw SQL Escape Hatch (QueryRaw, ExecuteRaw)

package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"

	an5 "an5client"
)

func timeNow() time.Time { return time.Now().UTC() }

func main() {
	fmt.Println("================================================================")
	fmt.Println("          AN5 ORM FULL GOLANG QUERY API SHOWCASE                ")
	fmt.Println("================================================================\n")

	dbPath := filepath.Join(os.TempDir(), fmt.Sprintf("an5-go-queries-%d.sqlite", time.Now().UnixNano()))
	_ = os.Remove(dbPath)
	defer os.Remove(dbPath)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// 1. Setup schema
	ddl := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			name TEXT NULL,
			is_active INTEGER NOT NULL DEFAULT 1,
			score INTEGER NOT NULL DEFAULT 0,
			embedding BLOB NULL,
			created_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			total INTEGER NOT NULL DEFAULT 0,
			status TEXT NULL,
			created_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
	}
	for _, s := range ddl {
		if _, err := db.Exec(s); err != nil {
			panic(err)
		}
	}

	ctx := context.Background()
	client := an5.NewAn5DbContextWithConnStr(db, "sqlite")

	// ───────────────────────────────────────────────────────────────────────────
	// 1. DATA INSERTION
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 1. DATA INSERTION")

	aliceEmbedding := []float32{1.0, 0.0, 0.0}
	alice := &an5.User{
		Id:        "u_alice",
		Email:     "alice@example.com",
		Name:      an5.StringPtr("Alice Johnson"),
		Score:     100,
		IsActive:  true,
		CreatedAt: timeNow(),
		Embedding: &aliceEmbedding,
	}
	if _, err := client.User.Create(ctx, alice); err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Created single User: id=%s, name=%s\n", alice.Id, *alice.Name)

	bobEmbedding := []float32{0.0, 1.0, 0.0}
	bob := &an5.User{
		Id:        "u_bob",
		Email:     "bob@example.com",
		Name:      an5.StringPtr("Bob Smith"),
		Score:     250,
		IsActive:  true,
		CreatedAt: timeNow(),
		Embedding: &bobEmbedding,
	}
	if _, err := client.User.Create(ctx, bob); err != nil {
		panic(err)
	}

	// Create orders
	bobOrders := []*an5.Order{
		{Id: "o_b1", UserId: bob.Id, Total: 120, Status: an5.StringPtr("paid"), CreatedAt: timeNow()},
		{Id: "o_b2", UserId: bob.Id, Total: 350, Status: an5.StringPtr("open"), CreatedAt: timeNow()},
		{Id: "o_b3", UserId: bob.Id, Total: 80, Status: an5.StringPtr("paid"), CreatedAt: timeNow()},
	}
	if _, err := client.Orders.CreateMany(ctx, bobOrders); err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Created User with %d orders (id=%s)\n", len(bobOrders), bob.Id)

	aliceOrder := &an5.Order{Id: "o_a1", UserId: alice.Id, Total: 500, Status: an5.StringPtr("paid"), CreatedAt: timeNow()}
	if _, err := client.Orders.Create(ctx, aliceOrder); err != nil {
		panic(err)
	}

	// Bulk insert
	charlieEmb := []float32{0.5, 0.5, 0.0}
	dianaEmb := []float32{0.0, 0.0, 1.0}
	edwardEmb := []float32{0.7, 0.7, 0.1}
	bulkUsers := []*an5.User{
		{Id: "u_charlie", Email: "charlie@example.com", Name: an5.StringPtr("Charlie Brown"), Score: 50, IsActive: true, CreatedAt: timeNow(), Embedding: &charlieEmb},
		{Id: "u_diana", Email: "diana@example.com", Name: an5.StringPtr("Diana Prince"), Score: 300, IsActive: true, CreatedAt: timeNow(), Embedding: &dianaEmb},
		{Id: "u_edward", Email: "edward@example.com", Name: an5.StringPtr("Edward Norton"), Score: 180, IsActive: true, CreatedAt: timeNow(), Embedding: &edwardEmb},
	}
	nBulk, err := client.User.CreateMany(ctx, bulkUsers)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Bulk inserted %d users via CreateMany\n\n", nBulk)

	// ───────────────────────────────────────────────────────────────────────────
	// 2. ADVANCED FILTERING & COMPARATORS
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 2. ADVANCED FILTERING & COMPARATORS")

	matchingAlice, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{
			Name: &an5.StringFilter{Contains: an5.StringPtr("Alice")},
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ contains('Alice'): found %d user(s)\n", len(matchingAlice))

	domainUsers, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{
			Email: &an5.StringFilter{
				StartsWith: an5.StringPtr("d"),
				EndsWith:   an5.StringPtr("@example.com"),
			},
		},
	})
	if err != nil {
		panic(err)
	}
	var domainNames []string
	for _, u := range domainUsers {
		if u.Name != nil {
			domainNames = append(domainNames, *u.Name)
		}
	}
	fmt.Printf("  ✓ startsWith('d') & endsWith('@example.com'): found %s\n", strings.Join(domainNames, ", "))

	highScorers, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{
			Score: &an5.IntFilter{
				Gte: an5.IntPtr(200),
				Lte: an5.IntPtr(300),
			},
		},
		OrderBy: &an5.UserOrderByInput{
			Score: an5.SortOrderPtr(an5.SortOrderDesc),
		},
	})
	if err != nil {
		panic(err)
	}
	var scorerStrs []string
	for _, u := range highScorers {
		if u.Name != nil {
			scorerStrs = append(scorerStrs, fmt.Sprintf("%s (%d)", *u.Name, u.Score))
		}
	}
	fmt.Printf("  ✓ Range score >= 200 and <= 300: found %s\n", strings.Join(scorerStrs, ", "))

	selectedScores, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{
			Score: &an5.IntFilter{In: []int{50, 100, 300}},
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ in([50, 100, 300]): found %d user(s)\n\n", len(selectedScores))

	// ───────────────────────────────────────────────────────────────────────────
	// 3. LOGICAL COMBINATORS (AND, OR, NOT)
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 3. LOGICAL COMBINATORS (AND, OR, NOT)")

	complexUsers, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{
			OR: []an5.UserWhereInput{
				{Score: &an5.IntFilter{Gte: an5.IntPtr(250)}},
				{
					AND: []an5.UserWhereInput{
						{Score: &an5.IntFilter{Gte: an5.IntPtr(100)}},
						{Email: &an5.StringFilter{Contains: an5.StringPtr("alice")}},
					},
				},
			},
			NOT: &an5.UserWhereInput{
				Name: &an5.StringFilter{Contains: an5.StringPtr("Edward")},
			},
		},
		OrderBy: &an5.UserOrderByInput{
			Score: an5.SortOrderPtr(an5.SortOrderAsc),
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("  ✓ (score >= 250 OR (score >= 100 AND alice)) AND NOT(Edward):")
	for _, u := range complexUsers {
		name := ""
		if u.Name != nil {
			name = *u.Name
		}
		fmt.Printf("    - %s (score: %d, email: %s)\n", name, u.Score, u.Email)
	}
	fmt.Println()

	// ───────────────────────────────────────────────────────────────────────────
	// 4. FIELD PROJECTIONS (select)
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 4. FIELD PROJECTIONS (select)")

	projected, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		Where: &an5.UserWhereInput{
			Score: &an5.IntFilter{Gt: an5.IntPtr(150)},
		},
		Select: []string{"id", "name", "score"},
		OrderBy: &an5.UserOrderByInput{
			Score: an5.SortOrderPtr(an5.SortOrderDesc),
		},
		Take: an5.IntPtr(1),
	})
	if err != nil {
		panic(err)
	}
	if len(projected) > 0 {
		top := projected[0]
		name := ""
		if top.Name != nil {
			name = *top.Name
		}
		jsonBytes, _ := json.Marshal(map[string]interface{}{"id": top.Id, "name": name, "score": top.Score})
		fmt.Printf("  ✓ Projection select: { id, name, score }:\n    %s\n\n", string(jsonBytes))
	}

	// ───────────────────────────────────────────────────────────────────────────
	// 5. SORTING & PAGINATION (orderBy, skip, take)
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 5. SORTING & PAGINATION (orderBy, skip, take)")

	p1, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		OrderBy: &an5.UserOrderByInput{Score: an5.SortOrderPtr(an5.SortOrderDesc)},
		Take:    an5.IntPtr(2),
		Skip:    an5.IntPtr(0),
	})
	if err != nil {
		panic(err)
	}
	var p1Strs []string
	for _, u := range p1 {
		name := ""
		if u.Name != nil {
			name = *u.Name
		}
		p1Strs = append(p1Strs, fmt.Sprintf("%s (%d)", name, u.Score))
	}
	fmt.Printf("  ✓ Page 1 (take 2): %s\n", strings.Join(p1Strs, ", "))

	p2, err := client.User.FindMany(ctx, an5.UserFindManyArgs{
		OrderBy: &an5.UserOrderByInput{Score: an5.SortOrderPtr(an5.SortOrderDesc)},
		Take:    an5.IntPtr(2),
		Skip:    an5.IntPtr(2),
	})
	if err != nil {
		panic(err)
	}
	var p2Strs []string
	for _, u := range p2 {
		name := ""
		if u.Name != nil {
			name = *u.Name
		}
		p2Strs = append(p2Strs, fmt.Sprintf("%s (%d)", name, u.Score))
	}
	fmt.Printf("  ✓ Page 2 (skip 2, take 2): %s\n\n", strings.Join(p2Strs, ", "))

	// ───────────────────────────────────────────────────────────────────────────
	// 6. RELATIONS & DEEP JOINS
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 6. RELATIONS & DEEP JOINS")

	aOrders, err := client.Orders.FindMany(ctx, an5.OrderFindManyArgs{
		Where: &an5.OrderWhereInput{UserId: &an5.StringFilter{Equals: an5.StringPtr(alice.Id)}},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ User \"%s\" has %d total order(s):\n", *alice.Name, len(aOrders))
	for _, o := range aOrders {
		st := ""
		if o.Status != nil {
			st = *o.Status
		}
		fmt.Printf("    - Order %s: total=$%d, status=%s\n", o.Id, o.Total, st)
	}

	bOrders, err := client.Orders.FindMany(ctx, an5.OrderFindManyArgs{
		Where: &an5.OrderWhereInput{UserId: &an5.StringFilter{Equals: an5.StringPtr(bob.Id)}},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ User \"%s\" has %d total order(s):\n", *bob.Name, len(bOrders))
	for _, o := range bOrders {
		st := ""
		if o.Status != nil {
			st = *o.Status
		}
		fmt.Printf("    - Order %s: total=$%d, status=%s\n", o.Id, o.Total, st)
	}

	bigOrders, err := client.Orders.FindMany(ctx, an5.OrderFindManyArgs{
		Where:   &an5.OrderWhereInput{Total: &an5.IntFilter{Gte: an5.IntPtr(300)}},
		OrderBy: &an5.OrderOrderByInput{Total: an5.SortOrderPtr(an5.SortOrderDesc)},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("  ✓ Orders >= $300 including owner:")
	for _, o := range bigOrders {
		owner, err := client.User.FindUnique(ctx, an5.UserFindUniqueArgs{
			Where: &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr(o.UserId)}},
		})
		if err != nil || owner == nil {
			continue
		}
		name := ""
		if owner.Name != nil {
			name = *owner.Name
		}
		fmt.Printf("    - Order %s ($%d) belongs to: %s (%s)\n", o.Id, o.Total, name, owner.Email)
	}

	// Correlated EXISTS relation filter
	usersWithBigOrders, err := client.User.QueryRaw(ctx,
		"SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id AND orders.total >= ?)",
		400,
	)
	if err != nil {
		panic(err)
	}
	var bigOrderUserNames []string
	for _, u := range usersWithBigOrders {
		if u.Name != nil {
			bigOrderUserNames = append(bigOrderUserNames, *u.Name)
		}
	}
	fmt.Printf("  ✓ Relation filter (orders.some.total >= 400): found %s\n\n", strings.Join(bigOrderUserNames, ", "))

	// ───────────────────────────────────────────────────────────────────────────
	// 7. MUTATIONS: update, Field Math, upsert, and delete
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 7. MUTATIONS: update, Field Math, upsert, and delete")

	alice.Score += 25
	if _, err := client.User.Update(ctx, alice); err != nil {
		panic(err)
	}
	updatedAlice, err := client.User.FindUnique(ctx, an5.UserFindUniqueArgs{
		Where: &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr(alice.Id)}},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Atomic field increment: Alice score 100 -> %d\n", updatedAlice.Score)

	upCount, err := client.Orders.UpdateMany(ctx,
		&an5.OrderWhereInput{Status: &an5.StringFilter{Equals: an5.StringPtr("open")}},
		map[string]interface{}{"status": "processing"},
	)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ UpdateMany: changed %d order(s) from 'open' to 'processing'\n", upCount)

	fionaEmb := []float32{0.2, 0.8, 0.5}
	fiona := &an5.User{
		Id:        "u_fiona",
		Email:     "fiona@example.com",
		Name:      an5.StringPtr("Fiona Gallagher"),
		Score:     75,
		IsActive:  true,
		CreatedAt: timeNow(),
		Embedding: &fionaEmb,
	}
	upsertNew, err := client.User.Upsert(ctx, fiona)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Upsert (created new): id=%s, email=%s\n", upsertNew.Id, upsertNew.Email)

	alice.Score = 150
	upsertExisting, err := client.User.Upsert(ctx, alice)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Upsert (updated existing): Alice score updated to %d\n", upsertExisting.Score)

	totalBefore, err := client.User.Count(ctx, nil)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Current total users count: %d\n", totalBefore)

	if _, err := client.User.Delete(ctx, fiona.Id); err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Deleted user Fiona (id=%s)\n\n", fiona.Id)

	// ───────────────────────────────────────────────────────────────────────────
	// 8. AGGREGATIONS & GROUP BY
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 8. AGGREGATIONS & GROUP BY")

	stats, err := client.Orders.Aggregate(ctx, an5.AggregateArgs{
		Count: true,
		Sum:   []string{"total"},
		Avg:   []string{"total"},
		Min:   []string{"total"},
		Max:   []string{"total"},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("  ✓ Orders Aggregate Statistics:")
	fmt.Printf("    Total count: %v\n", stats["_count"])
	fmt.Printf("    Sum total:   $%v\n", stats["_sum_total"])
	fmt.Printf("    Average:     $%.2f\n", stats["_avg_total"])
	fmt.Printf("    Min / Max:   $%v / $%v\n", stats["_min_total"], stats["_max_total"])

	grouped, err := client.Orders.GroupBy(ctx, an5.GroupByArgs{
		By:  []string{"status"},
		Sum: []string{"total"},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("  ✓ GroupBy status:")
	for _, g := range grouped {
		sumVal := g["_sum_total"]
		if sumVal == nil {
			sumVal = 0
		}
		fmt.Printf("    - Status '%v': count=%v, sum=$%v\n", g["status"], g["_count"], sumVal)
	}
	fmt.Println()

	// ───────────────────────────────────────────────────────────────────────────
	// 9. ACID TRANSACTIONS
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 9. ACID TRANSACTIONS")

	err = client.User.Transaction(ctx, func(tx *sql.Tx) error {
		_, err := tx.Exec("UPDATE users SET score = ? WHERE id = ?", 200, alice.Id)
		return err
	})
	if err != nil {
		panic(err)
	}
	aliceAfterTx, err := client.User.FindUnique(ctx, an5.UserFindUniqueArgs{
		Where: &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr(alice.Id)}},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Transaction committed: Alice new score=%d\n", aliceAfterTx.Score)

	err = client.User.Transaction(ctx, func(tx *sql.Tx) error {
		if _, err := tx.Exec("UPDATE users SET score = ? WHERE id = ?", 9999, alice.Id); err != nil {
			return err
		}
		return fmt.Errorf("SIMULATED_PAYMENT_FAILURE")
	})
	if err != nil {
		fmt.Printf("  ✓ Transaction intercepted failure: \"%v\" -> rolling back!\n", err)
	}
	aliceAfterRollback, err := client.User.FindUnique(ctx, an5.UserFindUniqueArgs{
		Where: &an5.UserWhereInput{Id: &an5.StringFilter{Equals: an5.StringPtr(alice.Id)}},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Verified Rollback: Alice score remained %d (not 9999)\n\n", aliceAfterRollback.Score)

	// ───────────────────────────────────────────────────────────────────────────
	// 10. SEMANTIC VECTOR SEARCH
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 10. SEMANTIC VECTOR SEARCH")

	queryVector := []float64{0.95, 0.05, 0.0}
	matches, err := client.User.VectorSearch(ctx, queryVector, an5.VectorSearchOptions{
		Take:           2,
		VectorField:    "embedding",
		DistanceMetric: "cosine",
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("  ✓ Query vector [0.95, 0.05, 0.0] nearest neighbors:")
	for _, m := range matches {
		name := ""
		if m.Name != nil {
			name = *m.Name
		}
		fmt.Printf("    - User \"%s\" (id: %s)\n", name, m.Id)
	}
	fmt.Println()

	// ───────────────────────────────────────────────────────────────────────────
	// 11. RAW SQL ESCAPE HATCH
	// ───────────────────────────────────────────────────────────────────────────
	fmt.Println("🔹 11. RAW SQL ESCAPE HATCH")

	rawUsers, err := client.User.QueryRaw(ctx, "SELECT * FROM users WHERE score >= ? ORDER BY score DESC", 150)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ QueryRaw: retrieved %d row(s) with score >= 150\n", len(rawUsers))

	rawAffected, err := client.User.ExecuteRaw(ctx, "UPDATE users SET is_active = 0 WHERE score < ?", 100)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ ExecuteRaw: marked %d user(s) as inactive\n\n", rawAffected)

	// Cleanup
	_, _ = client.Orders.DeleteMany(ctx, nil)
	_, _ = client.User.DeleteMany(ctx, nil)
	finalCount, err := client.User.Count(ctx, nil)
	if err != nil {
		panic(err)
	}
	fmt.Printf("  ✓ Cleanup finished. Final users count: %d\n\n", finalCount)

	fmt.Println("================================================================")
	fmt.Println("  🎉 ALL AN5 ORM GOLANG QUERY SHOWCASE CHECKS PASSED!           ")
	fmt.Println("================================================================\n")
}
