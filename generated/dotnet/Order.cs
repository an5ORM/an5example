// This file is auto-generated. Do not edit directly.
using System;
using System.Collections.Generic;

namespace An5Orm.Entities
{
    public class Order
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public int Total { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // ── Relations ────────────────────────────────────────────────────────
        public User User { get; set; }
    }
}
