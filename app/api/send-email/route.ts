import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { type, data, locale = 'en' } = await req.json();
    const url = new URL(req.url);

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn("EMAIL_USER or EMAIL_PASS not set in environment variables. Skipping email automation.");
      return NextResponse.json({ success: true, message: "Email skipped (no env)" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    const isAr = locale === 'ar';
    const clientEmail = 'employeewixsabbir@gmail.com';
    let userSubject = '';
    let userHtml = '';
    let clientSubject = '';
    let clientHtml = '';

    // Use a publicly accessible URL for the logo so it renders in email clients even when testing locally
    const logoUrl = 'https://i.ibb.co/Lz1fCCF2/logo.jpg';

    const getEmailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="${locale}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #dddddd; }
    .header { background-color: #0B2545; padding: 30px; text-align: center; border-bottom: 4px solid #D4AF37; }
    .header img { max-width: 120px; height: auto; border-radius: 8px; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #eeeeee; }
    h2 { color: #0B2545; margin-top: 0; font-size: 24px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .data-table th, .data-table td { padding: 12px; text-align: ${isAr ? 'right' : 'left'}; border-bottom: 1px solid #eeeeee; }
    .data-table th { color: #0B2545; font-weight: bold; width: 35%; background: #fafafa; border-right: 1px solid #eeeeee; }
    .data-table td { color: #555555; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: #0B2545; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Young Leaders Academy Logo" />
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Young Leaders Academy.<br>
      <a href="https://youngleadersacademy.com" style="color: #D4AF37; text-decoration: none;"> ${isAr ? 'قم بزيارة موقعنا' : 'Visit our website'} </a>
    </div>
  </div>
</body>
</html>
    `;

    if (type === 'apply') {
      const { first_name, last_name, email, program_id } = data;
      const name = `${first_name} ${last_name}`;

      userSubject = isAr ? 'تم استلام طلبك - Young Leaders Academy' : 'Application Received - Young Leaders Academy';
      userHtml = getEmailWrapper(`
        <h2>${isAr ? 'مرحباً' : 'Hello'} ${name},</h2>
        <p>${isAr ? 'لقد تلقينا طلبك بنجاح للبرنامج التالي:' : 'We have successfully received your application for the following program:'}</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #D4AF37; margin: 20px 0;">
          <h3 style="margin: 0; color: #0B2545;">${program_id}</h3>
        </div>
        <div style="background: #ffffff; border: 1px solid #eeeeee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0B2545;">${isAr ? 'تفاصيل الدفع' : 'Payment Details'}</h4>
          <p style="margin: 5px 0; color: #555555;">${isAr ? 'الرسوم الأساسية' : 'Base Program Fee'}: 1500 SAR</p>
          <p style="margin: 5px 0; color: #555555;">${isAr ? 'ضريبة القيمة المضافة (15%)' : '15% VAT'}: 225 SAR</p>
          <p style="margin: 5px 0; font-weight: bold; color: #0B2545;">${isAr ? 'الإجمالي المدفوع' : 'Total Paid'}: 1725 SAR</p>
        </div>
        <p>${isAr ? 'سيقوم فريق القبول لدينا بمراجعة طلبك والرد عليك قريباً.' : 'Our admissions team will review your application and get back to you shortly.'}</p>
      `);

      clientSubject = `New Application: ${name}`;
      clientHtml = getEmailWrapper(`
        <h2>New Application Received 🎓</h2>
        <p>A new student has submitted an application form. Here are the details:</p>
        <table class="data-table">
          <tr><th>Full Name</th><td>${name}</td></tr>
          <tr><th>Email</th><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><th>Phone</th><td>${data.phone}</td></tr>
          <tr><th>Age</th><td>${data.age}</td></tr>
          <tr><th>School</th><td>${data.school}</td></tr>
          <tr><th>Program</th><td><strong>${program_id}</strong></td></tr>
          <tr><th>Payment</th><td>Base: 1500 SAR + 15% VAT: 225 SAR = <strong>Total Paid: 1725 SAR</strong></td></tr>
          <tr><th>Motivation</th><td>${data.motivation}</td></tr>
          <tr><th>PDPL Consent</th><td>Yes, agreed to share data with target university</td></tr>
        </table>
      `);
    } else if (type === 'contact') {
      const { full_name, email, subject, message } = data;

      userSubject = isAr ? 'تلقينا رسالتك - Young Leaders Academy' : 'Message Received - Young Leaders Academy';
      userHtml = getEmailWrapper(`
        <h2>${isAr ? 'مرحباً' : 'Hello'} ${full_name},</h2>
        <p>${isAr ? 'شكراً لتواصلك معنا. لقد تلقينا رسالتك وسنقوم بالرد عليك في أقرب وقت ممكن.' : 'Thank you for reaching out to us. We have received your message and our team will get back to you as soon as possible.'}</p>
        <p><strong>${isAr ? 'الموضوع:' : 'Subject:'}</strong> ${subject}</p>
      `);

      clientSubject = `New Contact Message: ${subject}`;
      clientHtml = getEmailWrapper(`
        <h2>New Contact Message ✉️</h2>
        <p>A user has submitted a message via the contact form.</p>
        <table class="data-table">
          <tr><th>Full Name</th><td>${full_name}</td></tr>
          <tr><th>Email</th><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><th>Subject</th><td><strong>${subject}</strong></td></tr>
          <tr><th>Message</th><td>${message}</td></tr>
        </table>
      `);
    } else if (type === 'newsletter') {
      const { email } = data;

      userSubject = isAr ? 'مرحباً بك في نشرتنا الإخبارية - Young Leaders Academy' : 'Welcome to our Newsletter - Young Leaders Academy';
      userHtml = getEmailWrapper(`
        <div style="text-align: center;">
          <h2 style="font-size: 28px;">${isAr ? 'أهلاً بك!' : 'Welcome!'} 🎉</h2>
          <p>${isAr ? 'شكراً لاشتراكك في نشرتنا الإخبارية!' : 'Thank you for subscribing to our newsletter!'}</p>
          <p>${isAr ? 'سنبقيك على اطلاع دائم بآخر الأخبار، البرامج الجديدة، والفرص المميزة.' : 'We will keep you updated with the latest news, new programs, and exclusive opportunities.'}</p>
          <a href="${url.origin}" class="btn">${isAr ? 'اكتشف برامجنا' : 'Explore Programs'}</a>
        </div>
      `);

      clientSubject = `New Newsletter Subscriber`;
      clientHtml = getEmailWrapper(`
        <h2>New Subscriber 📰</h2>
        <p>A new user has just subscribed to the newsletter.</p>
        <table class="data-table">
          <tr><th>Email</th><td><a href="mailto:${email}">${email}</a></td></tr>
        </table>
      `);
    } else if (type === 'request-info') {
      const { full_name, email, phone, university_name } = data;

      userSubject = isAr ? `طلب معلومات: ${university_name}` : `Information Request: ${university_name}`;
      userHtml = getEmailWrapper(`
        <h2>${isAr ? 'مرحباً' : 'Hello'} ${full_name},</h2>
        <p>${isAr ? 'شكراً لاهتمامك بجامعة' : 'Thank you for your interest in'} <strong>${university_name}</strong>.</p>
        <p>${isAr ? 'لقد تم تسجيل طلبك للحصول على معلومات، وسيتواصل معك أحد مستشارينا قريباً.' : 'We have received your information request and one of our advisors will reach out to you shortly.'}</p>
      `);

      clientSubject = `New University Lead: ${university_name}`;
      clientHtml = getEmailWrapper(`
        <h2>New University Lead 🎓</h2>
        <p>A new lead has requested information about <strong>${university_name}</strong>.</p>
        <table class="data-table">
          <tr><th>Full Name</th><td>${full_name}</td></tr>
          <tr><th>Email</th><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><th>Phone</th><td>${phone}</td></tr>
          <tr><th>Target University</th><td>${university_name}</td></tr>
        </table>
      `);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Send emails
    const userEmailAddress = type === 'newsletter' ? data.email : (data.email || '');

    if (userEmailAddress) {
      await transporter.sendMail({
        from: `"Young Leaders Academy" <${user}>`,
        to: userEmailAddress,
        subject: userSubject,
        html: userHtml,
      });
    }

    await transporter.sendMail({
      from: `"YLA System" <${user}>`,
      to: clientEmail,
      subject: clientSubject,
      html: clientHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
