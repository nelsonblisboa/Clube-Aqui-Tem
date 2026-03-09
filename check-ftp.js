import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

async function checkDir() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "alderaan08.umbler.host",
            user: "clubeaquitem-com-br",
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false
        });

        console.log("Listing ROOT directory:");
        const list = await client.list("/");
        list.forEach(f => console.log(f.name));

        console.log("\nListing PUBLIC directory:");
        try {
            const listP = await client.list("/public");
            listP.forEach(f => console.log(f.name));
        } catch (e) { }
    } catch (e) {
        console.error(e);
    }
    client.close();
}
checkDir();
