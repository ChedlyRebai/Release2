import { createTransport } from "nodemailer";
const transporter = createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "chedly.rebai123@gmail.com",
    pass: "fsvgiqmnstpxuibe",
  },
});

// async..await is not allowed in global scope, must use a wrapper
export async function SendEmail(to: string, subject: string, text: string) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "chedly.rebai123@gmail.com", // sender address
    to: "raouaragmoun88@gmail.com", // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    </head>
    <body >
        <div style="position: fixed; z-index: 10; inset: 0; overflow-y: auto;  text-align: center;">
            <div style="display: flex; align-items: end; justify-content: center; min-height: 50vh; padding-top: 4rem; padding-left: 4px; padding-right: 4px; padding-bottom: 20px; text-align: center;">
                
                <span style="display: inline-block; height: 50vh; vertical-align: middle;" aria-hidden="true">&#8203;</span>
                <div style="position: relative; display: inline-block; background-color: white; border-radius: 8px; padding: 1rem; text-align: left; box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05); transition-all: 0.3s; max-width: 100%; width: 100%; max-width: 32rem; padding: 1.5rem;">
                    <div>
                    <div style="margin-top: 1rem; text-align: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/fr/d/de/Logo_Amen_Bank.png"  >        
                        
                    
                        
                            <h3 style="font-size: 1.125rem; font-weight: 500; color: #111827;" id="modal-title">${subject}</h3>
                            <div style="margin-top: 0.5rem;">
                                <p style="font-size: 0.875rem; color: #6b7280;">${text}</p>
                            </div>
                        </div>
                    </div>      
                </div>
            </div>
        </div>
    </body>
    </html>
    
        `, // html body
  });
  //   <div style="margin-top: 1.25rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
  //                         <button type="button" style="width: 100%; display: inline-flex; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.375rem; background-color: #6366f1; color: white; font-size: 1rem; font-weight: 500; text-align: center; border: none; cursor: pointer; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">Deactivate</button>
  //                         <button type="button" style="margin-top: 0.75rem; width: 100%; display: inline-flex; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.375rem; background-color: white; color: #374151; font-size: 1rem; font-weight: 500; text-align: center; border: 1px solid #d1d5db; cursor: pointer; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">Cancel</button>
  //                     </div>

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
