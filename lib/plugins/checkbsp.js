/**
👑 Q U E E N - A N Y A - M D - #v2

🔗 Dev: https://wa.me/918811074852 (@PikaBotz)
🔗 Team: Tᴇᴄʜ Nɪɴᴊᴀ Cʏʙᴇʀ Sϙᴜᴀᴅꜱ (𝚻.𝚴.𝐂.𝐒) 🚀📌 (under @P.B.inc)

📜 GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

📌 Permission & Copyright:
If you're using any of these codes, please ask for permission or mention https://github.com/PikaBotz/Anya_v2-MD in your repository.

⚠️ Warning:
- This bot is not an officially certified WhatsApp bot.
- Report any bugs or glitches to the developer.
- Seek permission from the developer to use any of these codes.
- This bot does not store user's personal data.
- Certain files in this project are private and not publicly available for edit/read (encrypted).
- The repository does not contain any misleading content.
- The developer has not copied code from repositories they don't own. If you find matching code, please contact the developer.

Contact: alammdarif07@gmail.com (for reporting bugs & permission)
          https://wa.me/918811074852 (to contact on WhatsApp)

🚀 Thank you for using Queen Anya MD v2! 🚀
**/

exports.cmdName = () => {
  return {
    name: ['checkbsp'],
    alias: ['business'],
    category: "stalker",
    desc: "Check the business account details of any user that have a business profile on WhatsApp."
  };
}

exports.getCommand = async (userSudo, userOwner, text, prefix, command, anyaV2, pika) => {
require('../../config');
  const { tiny } = require('../lib/stylish-font');
  if (!userOwner && !userSudo) return pika.reply(message.owner);
      if (!text && !pika.quoted) return pika.reply("Provide me a number.");
  const num = pika.quoted ? pika.quoted.sender : text.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const profile = await anyaV2.getBusinessProfile(num);
  if (!profile) return pika.reply("Maybe not an business account.");
  await pika.react("🌌");
  pika.reply(`*📌 ${tiny("Category")} :* ${profile.category}\n\n*🔖 ${tiny("Desc")} :* ${profile.description}`);
 }
 




