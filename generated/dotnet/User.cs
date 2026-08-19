// This file is auto-generated. Do not edit directly.
using System;
using System.Collections.Generic;

namespace An5Orm.Entities
{
    public class User
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public int Score { get; set; }
        public DateTime CreatedAt { get; set; }

        // ── Relations ────────────────────────────────────────────────────────
        public List<Order> Orders { get; set; } = new List<Order>();
    }
}
