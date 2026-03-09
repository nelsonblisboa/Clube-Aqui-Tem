import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

async function addTestTxt() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "alderaan08.umbler.host",
            user: "clubeaquitem-com-br",
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false
        });

        await client.cd("public");
        const fs = await import('fs');
        fs.writeFileSync('test.txt', 'HELLO WORLD');
        await client.uploadFrom('test.txt', 'test.txt');
        console.log("Success test.txt -> public/");
    } catch (err) {
        console.error("FTP Error or file not found:", err);
    }
    client.close();
}

addTestTxt();
