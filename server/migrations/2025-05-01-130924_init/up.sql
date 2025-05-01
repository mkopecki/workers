-- Your SQL goes here
CREATE TABLE run (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      TEXT NOT NULL
                CHECK(status IN ('queued','processing','success','failure'))
);

