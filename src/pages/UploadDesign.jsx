
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 50;

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  margin: "8px 0 18px",
  border: "1px solid #ccc",
  borderRadius: 6,
};

export default function UploadDesign() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Saree");
  const [price, setPrice] = useState("500");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  // Create and clean up preview URLs whenever the selected files change.
  useEffect(() => {
    const urls = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(urls);

    return () => {
      urls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    const input = event.target;

    setMessage("");

    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      setMessage(`You can select a maximum of ${MAX_FILES} files.`);
      setMessageType("error");
      input.value = "";
      return;
    }

    const existingKeys = new Set(
      files.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
    );

    const newFiles = [];

    for (const file of selectedFiles) {
      const extension = file.name.split(".").pop().toLowerCase();
      const key = `${file.name}-${file.size}-${file.lastModified}`;

      if (!["svg", "png"].includes(extension)) {
        setMessage(`${file.name}: only SVG and PNG files are allowed.`);
        setMessageType("error");
        input.value = "";
        return;
      }

      if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        setMessage(`${file.name}: file must be larger than 0 bytes and no more than 5 MB.`);
        setMessageType("error");
        input.value = "";
        return;
      }

      if (existingKeys.has(key)) continue;

      existingKeys.add(key);
      newFiles.push(file);
    }

    setFiles((previous) => [...previous, ...newFiles]);
    input.value = "";
  }

  function removeFile(indexToRemove) {
    setFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleUpload(event) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a design name.");
      setMessageType("error");
      return;
    }

    if (files.length === 0) {
      setMessage("Please select at least one SVG or PNG file.");
      setMessageType("error");
      return;
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage("Please enter a valid price greater than zero.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in before uploading designs.");
      setMessageType("error");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("price", String(parsedPrice));

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/admin/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setMessage(
        data.message ||
          `Upload completed successfully for ${files.length} selected file(s).`
      );
      setMessageType("success");
      setFiles([]);
      setName("");
      setCategory("Saree");
      setPrice("500");
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to upload designs. Please check your backend server."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "35px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/admin")}
        style={{
          padding: "10px 16px",
          border: "1px solid #ccc",
          borderRadius: 6,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ marginTop: 28 }}>Upload Designs</h1>
      <p>Upload multiple SVG or PNG designs to Motifora in one operation.</p>

      <form
        onSubmit={handleUpload}
        style={{
          marginTop: 24,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <label htmlFor="designName">Design Name</label>
        <input
          id="designName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter a name for these designs"
          required
          maxLength={120}
          style={inputStyle}
        />

        <p style={{ fontSize: 13, color: "#666", marginTop: -10 }}>
          This name will be sent with every selected file. Individual filenames
          will be retained by the upload service where supported.
        </p>

        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          style={inputStyle}
        >
          <option value="Saree">Saree</option>
          <option value="Blouse">Blouse</option>
          <option value="Border">Border</option>
          <option value="Motif">Motif</option>
          <option value="Pallu">Pallu</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="price">Price per Design (₹)</label>
        <input
          id="price"
          type="number"
          min="1"
          step="1"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
          style={inputStyle}
        />

        <label htmlFor="designFiles">Choose Design Files</label>
        <input
          id="designFiles"
          type="file"
          accept=".svg,.png,image/svg+xml,image/png"
          multiple
          onChange={handleFileChange}
          style={inputStyle}
        />

        <p style={{ fontSize: 13, color: "#666" }}>
          Supported formats: SVG and PNG. Maximum 5 MB per file and 50 files
          per selection/upload batch.
        </p>

        {files.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 20 }}>
              Selected Designs ({files.length})
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 16,
                marginTop: 16,
              }}
            >
              {previews.map(({ file, url }, index) => (
                <article
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  style={{
                    minWidth: 0,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      height: 130,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fafafa",
                      borderRadius: 5,
                    }}
                  >
                    <img
                      src={url}
                      alt={file.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <p
                    title={file.name}
                    style={{
                      fontSize: 13,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {file.name}
                  </p>

                  <p style={{ fontSize: 12, color: "#666" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #ccc",
                      borderRadius: 5,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {message && (
          <p
            role="status"
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 6,
              background: messageType === "error" ? "#fff0f0" :
                messageType === "success" ? "#effaf0" : "#f5f5f5",
              color: messageType === "error" ? "#b42318" :
                messageType === "success" ? "#187333" : "#333",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || files.length === 0}
          style={{
            width: "100%",
            marginTop: 24,
            padding: 14,
            border: "none",
            borderRadius: 6,
            background: loading || files.length === 0 ? "#999" : "#222",
            color: "#fff",
            fontSize: 16,
            cursor: loading || files.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Uploading Designs..."
            : `Upload ${files.length || ""} Design${files.length === 1 ? "" : "s"}`}
        </button>
      </form>
    </main>
  );
}
