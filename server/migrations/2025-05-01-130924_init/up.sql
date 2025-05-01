CREATE TABLE run (
    id          TEXT PRIMARY KEY,
    status      TEXT NOT NULL
                CHECK(status IN ('queued','processing','success','failure'))
);

