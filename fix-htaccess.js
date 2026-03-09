import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

async function removeHtaccess() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "alderaan08.umbler.host",
            user: "clubeaquitem-com-br",
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false
        });

        console.log("Renaming public/.htaccess to public/.htaccess.bak");
        await client.rename("public/.htaccess", "public/.htaccess.bak");
        console.log("Success!");
    } catch (err) {
        console.error("FTP Error or file not found:", err);
    }
    client.close();
}

removeHtaccess();
