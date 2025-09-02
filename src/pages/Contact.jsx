import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";

export default function Contact() {
  const formRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus("sending");
    setMessage("");
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("Missing EmailJS env configuration");
      }

      const result = await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current,
        { publicKey }
      );
      if (result.status === 200) {
        setStatus("sent");
        setMessage("Message sent successfully.");
        formRef.current.reset();
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to send message. Please try again later.");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Contact Us</h2>
        <div className="contact-layout">
          <form ref={formRef} className="contact-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                name="user_name"
                id="name"
                type="text"
                placeholder="Your name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                name="user_email"
                id="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea
                name="message"
                id="message"
                rows="5"
                placeholder="How can we help?"
                required
              />
            </div>
            <button
              className="btn primary"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
            {message && <p>{message}</p>}
          </form>
          <div className="map">
            <iframe
              title="Rydex Motors Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31910.280000000003!2d36.807!3d-1.292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1700000000000"
              width="100%"
              height="240"
              style={{ border: 0, borderRadius: 8 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p>Ground floor Prestige plaza, Ngong road, Nairobi kenya.</p>
            <p>
              Phone: <a href="tel:020207333">020207333</a>
            </p>
            <p>
              Email:
              <a href="mailto:info@rydexmotorsltd.co.ke">
                info@rydexmotorsltd.co.ke
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
