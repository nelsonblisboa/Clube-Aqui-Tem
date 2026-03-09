import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

async function checkFTP() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "alderaan08.umbler.host",
            user: "clubeaquitem-com-br",
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false
        });

        await client.ensureDir("tmp");
        const fs = await import('fs');
        fs.writeFileSync('restart.txt', new Date().getTime().toString());
        await client.uploadFrom('restart.txt', 'tmp/restart.txt');
        console.log("Uploaded restart.txt to tmp/");
    } catch (err) {
        console.error(err);
    }
    client.close();
}
checkFTP();
