console.log("test");
for (let i = 0; i < 5; i++) {
    console.log("Hello via Bun!");
    console.log(Bun.argv);
    await Bun.sleep(5 * 1000);
}
