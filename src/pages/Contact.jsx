import { useState } from "react";
import { api } from "../utils/api";
import MediaUploader from "../components/ui/MediaUploader";
import {
  validateForm,
  isValid,
  required,
  email as emailRule,
  minLen,
} from "../utils/validation";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm(formData, {
      name: [required("Name")],
      email: [required("Email"), emailRule],
      message: [required("Message"), minLen(10, "Message")],
    });
    if (!isValid(errs)) {
      setFormErr(Object.values(errs)[0]);
      return;
    }
    setFormErr("");
    setBusy(true);
    try {
      await api.support.contact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        images,
        videos,
      });
      alert("Message sent! We will get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setImages([]);
      setVideos([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      style={{
        padding: "120px 52px 100px",
        maxWidth: "800px",
        margin: "0 auto",
      }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div
            className="grl"
            style={{
              background: "linear-gradient(90deg, transparent, #D4AF37)",
            }}
          />
          <span className="grt">Get in Touch</span>
          <div
            className="grl"
            style={{
              background: "linear-gradient(90deg, #D4AF37, transparent)",
            }}
          />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Contact</span> <em>Us</em>
        </h2>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "14px",
            color: "rgba(138,128,112,0.7)",
            marginTop: "16px",
          }}>
          Preserving Creativity and Heritage, While Safeguarding the
          Masterpieces and Memories That Define Them.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(212,175,55,0.1)",
          borderRadius: "16px",
          padding: "48px",
        }}>
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "#D4AF37",
              marginBottom: "8px",
            }}>
            NAME
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)",
              padding: "14px",
              color: "#e8e0d0",
              fontFamily: "'Raleway', sans-serif",
              outline: "none",
            }}
          />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "#D4AF37",
              marginBottom: "8px",
            }}>
            EMAIL
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)",
              padding: "14px",
              color: "#e8e0d0",
              fontFamily: "'Raleway', sans-serif",
              outline: "none",
            }}
          />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "#D4AF37",
              marginBottom: "8px",
            }}>
            PHONE (OPTIONAL)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)",
              padding: "14px",
              color: "#e8e0d0",
              fontFamily: "'Raleway', sans-serif",
              outline: "none",
            }}
          />
        </div>
        <div style={{ marginBottom: "32px" }}>
          <label
            style={{
              display: "block",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "#D4AF37",
              marginBottom: "8px",
            }}>
            MESSAGE
          </label>
          <textarea
            rows={5}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)",
              padding: "14px",
              color: "#e8e0d0",
              fontFamily: "'Raleway', sans-serif",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
        <div style={{ marginBottom: "32px" }}>
          <label
            style={{
              display: "block",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "#D4AF37",
              marginBottom: "8px",
            }}>
            PHOTOS &amp; VIDEOS (OPTIONAL) — ADD CONTEXT
          </label>
          <MediaUploader kind="image" multiple hint="UPLOAD PHOTOS" value={images} onChange={setImages} />
          <div style={{ height: 10 }} />
          <MediaUploader kind="video" multiple hint="UPLOAD VIDEOS" value={videos} onChange={setVideos} />
        </div>
        {formErr && (
          <p
            style={{
              color: "#ff8a8a",
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              marginBottom: 16,
            }}>
            {formErr}
          </p>
        )}
        <button
          type="submit"
          className="btn-gold"
          disabled={busy}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 999,
            padding: "0 32px",
            fontSize: 13,
            letterSpacing: "0.18em",
            boxShadow: "0 8px 24px rgba(212,175,55,0.3)",
          }}>
          SEND MESSAGE
        </button>
      </form>
    </section>
  );
}
