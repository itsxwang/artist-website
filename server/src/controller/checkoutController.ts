import { Request, Response } from "express";
import dotenv from "dotenv";
import artworkSchema from "../models/artworkModel";
import nodemailer from "nodemailer";
import { userEmails, Verification } from "../models/verifyModel";
import mongoose from "mongoose";
dotenv.config();

// Ensure MongoDB connection before querying
async function ensureConnection() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
}

export const postCheckout = async (req: Request, res: Response) => {
  try {
    // Ensure connection before querying
    await ensureConnection();

    const { name, email, address, phone, altPhone, countryCode } =
      req.body.userDetails;
    // check if email exists in userEmails collection
    const existingEmail = await userEmails.findOne({ email });

  if (!existingEmail) {
    // generate 6 digit random code
    const randomCode = Math.floor(100000 + Math.random() * 900000);

    // save verification request
    const verification = await Verification.create({ email, code: randomCode });

    // send 6 digit code by email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Samridhi Studio" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your code is ${randomCode}. It will expire in 10 minutes.`,
      replyTo: process.env.GMAIL_USER,
    });

    // send back the ID so frontend can use /verify?id=...
    return res.json({ _id: verification._id });
  }

  const artworks = await artworkSchema.find({
    _id: { $in: req.body.arts.map((a: any) => a._id) },
  });

  type artworkType = { title: string; quantity: number; totalprice: number };
  console.log("---------------------)", req.body.userDetails);
  if (artworks.length !== req.body.arts.length) {
    return res
      .status(400)
      .json({ error: "Some artworks not found or are out of stock." });
  }

  const finalArtworks: artworkType[] = [];

  for (let artwork of artworks) {
    for (let i of req.body.arts) {
      if (artwork._id.toString() === i._id.toString()) {
        // Check if stock is available
        if (artwork.stock_quantity < i.quantity) {
          return res
            .status(400)
            .json({ error: `Insufficient stock for ${artwork.title}` });
        }

        finalArtworks.push({
          title: artwork.title,
          quantity: i.quantity,
          totalprice: artwork.price * i.quantity,
        });

        artwork.stock_quantity -= i.quantity;
        await artwork.save();
        break;
      }
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // send to website owner
    await transporter.sendMail({
      from: `"Samridhi Studio" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New order from website by "${name}" :"`,
      text: `
            Name: ${name}
            Email: ${email}
            Address: ${address}
            Phone: +${countryCode} ${phone}
            Alternate Phone: ${altPhone ? "-" : altPhone} 
            Artworks: ${JSON.stringify(finalArtworks, null, 2)}`,
      replyTo: email,
    });

    //  send to user
    await transporter.sendMail({
      from: `"Samridhi Studio" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Order Confirmation",
      html: `
<!doctype html>
<html lang="en">
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.08);">

    <div style="padding:20px;border-bottom:1px solid #eee;">
      <h2 style="margin:0;font-size:18px;color:#333;">Order Confirmation</h2>
    </div>

    <div style="padding:20px;">
      <p style="font-size:15px;color:#333;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="font-size:15px;color:#333;line-height:1.5;">
        Your order has been successfully placed, and the artwork is ready to be packed and dispatched. I’ll prepare it with care and ship it soon.
      </p>

      <div style="border:1px solid #eee;border-radius:6px;padding:14px;margin-top:16px;">
        <p style="margin:0;font-size:14px;color:#555;">
          <strong>Artwork:</strong> ${finalArtworks
            .map((art) => `${art.title} (x${art.quantity})`)
            .join(", ")}<br>
          <strong>Amount:</strong> ${finalArtworks
            .reduce((total, art) => total + art.totalprice, 0)
            .toLocaleString("en-IN")} INR
        </p>
      </div>

      <div style="margin-top:18px;font-size:14px;color:#333;">
        <p style="margin:0 0 6px 0;font-weight:600;">Delivery details</p>
        <p style="margin:0;line-height:1.5;color:#555;">
          ${name}<br>
          ${address}<br>
          +${countryCode} ${phone}<br>
          ${altPhone ? `Alternate Phone: +${countryCode} ${altPhone}<br>` : ""}
        </p>
      </div>

      <p style="font-size:14px;color:#333;margin-top:18px;line-height:1.5;">
        You’ll receive a shipping notification with tracking details once the package is dispatched.
      </p>

      <p style="font-size:15px;color:#333;margin-top:20px;line-height:1.5;">
        I’m looking forward to sending this piece to you. If you have any questions or need anything, feel free to reach out anytime — simply reply to this email.
      </p>

      <p style="font-size:15px;color:#333;margin-top:18px;">
        Warm regards,<br>
        <strong>Samridhi</strong>
      </p>
    </div>

    <div style="padding:14px 20px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#777;text-align:center;">
      This email confirms that we have received your order.
    </div>

  </div>
</body>
</html>
`,
      replyTo: process.env.GMAIL_USER,
    });

    return res.status(200).json({
      message: "Order placed successfully",
      userDetails: { name, email, address, phone, altPhone, countryCode },
      artworks: finalArtworks,
    });
  } catch (error: any) {
    console.error("❌ Email sending error:", error);
    return res
      .status(500)
      .json({ error: "Checkout failed", details: error.message });
  }
  } catch (error: any) {
    console.error("❌ Checkout error:", error);
    return res
      .status(500)
      .json({ error: "Checkout failed", details: error.message });
  }
};
