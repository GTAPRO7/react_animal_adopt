import React, { useState, useRef } from "react";
import "./App.css";

// Sample training modules with video links
const TRAINING_MODULES = [
  {
    id: "TRN-01",
    title: "Basic Obedience & Sit Command",
    description: "Teach your pet the basic sit command using positive reinforcement.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    badge: "🥉 Obedience Novice"
  },
  {
    id: "TRN-02",
    title: "Leash Walking & Heel",
    description: "Master loose-leash walking without pulling or distraction.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    badge: "🥈 Leash Master"
  },
  {
    id: "TRN-03",
    title: "Advanced Recall (Come When Called)",
    description: "Ensure your pet returns immediately, even in high-distraction areas.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    badge: "🥇 Recall Champion"
  }
];

export default function App() {
  const [listings, setListings] = useState([]);
  const [view, setView] = useState("dashboard"); // "dashboard" | "owner" | "details" | "progress"
  const [adoptedCards, setAdoptedCards] = useState([]);

  // --- PROGRESS STATE ---
  const [completedTrainings, setCompletedTrainings] = useState([]);
  const [userVideos, setUserVideos] = useState([]);

  // --- INTERFACE 1: SHOP OWNER ---
  const OwnerInterface = () => {
    const [picture, setPicture] = useState("");
    const [type, setType] = useState("Dog");
    const [breed, setBreed] = useState("");
    const [gender, setGender] = useState("Male");
    const [age, setAge] = useState("");
    const [count, setCount] = useState(1);

    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPicture(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleAddPets = (e) => {
      e.preventDefault();
      const parsedCount = parseInt(count);
      if (parsedCount <= 0) {
        alert("Please enter a valid number of pets.");
        return;
      }

      const newIds = Array.from({ length: parsedCount }, (_, i) =>
        `PET-${type.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}-${i + 1}`
      );

      setListings((prev) => {
        const existingIndex = prev.findIndex(
          (l) => l.type === type && l.breed.toLowerCase() === breed.toLowerCase() &&
            l.gender === gender && l.age === age
        );

        if (existingIndex >= 0) {
          const updatedListings = [...prev];
          const existing = updatedListings[existingIndex];
          updatedListings[existingIndex] = {
            ...existing,
            count: existing.count + parsedCount,
            availableIds: [...existing.availableIds, ...newIds],
            picture: picture || existing.picture
          };
          alert(`Added ${parsedCount} pet(s) to existing listing.`);
          return updatedListings;
        } else {
          alert(`Created new listing with ${parsedCount} pet(s).`);
          return [
            ...prev,
            {
              id: `LIST-${Date.now()}`,
              picture: picture || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=500",
              type,
              breed,
              gender,
              age,
              count: parsedCount,
              availableIds: newIds
            }
          ];
        }
      });

      setPicture(""); setBreed(""); setAge(""); setCount(1);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
      <div className="form-container fade-in">
        <div className="form-header">
          <h2>Manage Animals</h2>
          <p>Register new animals for the adoption program.</p>
        </div>
        <form onSubmit={handleAddPets}>
          <div className="form-group photo-upload-group">
            <label>Pet Picture:</label>
            <label className="file-upload-btn">
              Choose a Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
            </label>
            {picture && <img src={picture} alt="Preview" className="img-preview" />}
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Type:</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Breed / Name:</label>
              <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required placeholder="e.g. Schnoodle" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Age:</label>
              <input type="text" value={age} onChange={(e) => setAge(e.target.value)} required placeholder="e.g. 1 year old" />
            </div>
            <div className="form-group half">
              <label>Count:</label>
              <input type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} required />
            </div>
          </div>

          <div className="form-group radio-group">
            <label>Gender:</label>
            <div className="radio-options">
              <label className={gender === "Male" ? "radio-selected" : ""}><input type="radio" value="Male" checked={gender === "Male"} onChange={(e) => setGender(e.target.value)} /> Male</label>
              <label className={gender === "Female" ? "radio-selected" : ""}><input type="radio" value="Female" checked={gender === "Female"} onChange={(e) => setGender(e.target.value)} /> Female</label>
            </div>
          </div>

          <button type="submit" className="btn submit-btn">Add to Listing</button>
        </form>
      </div>
    );
  };

  // --- INTERFACE 2: DASHBOARD FOR PEOPLE ---
  const DashboardInterface = () => {
    const [filterType, setFilterType] = useState("All");
    const [filterGender, setFilterGender] = useState("All");
    const [filterAge, setFilterAge] = useState("");

    const [selectedListing, setSelectedListing] = useState(null);
    const [adoptingPet, setAdoptingPet] = useState(null);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      training: false,
      nutritionist: false,
      adoptCount: 1
    });

    const filteredListings = listings.filter((listing) => {
      const matchType = filterType === "All" || listing.type === filterType;
      const matchGender = filterGender === "All" || listing.gender === filterGender;
      const matchAge = filterAge === "" || listing.age.toLowerCase().includes(filterAge.toLowerCase());
      return matchType && matchGender && matchAge;
    });

    const handleStartAdoption = () => {
      setAdoptingPet(selectedListing);
      setSelectedListing(null);
    };

    const handleFormSubmit = (e) => {
      e.preventDefault();
      const numToAdopt = parseInt(formData.adoptCount);

      if (numToAdopt <= 0 || numToAdopt > adoptingPet.count) {
        alert("Invalid number of pets selected.");
        return;
      }

      const adoptedIds = adoptingPet.availableIds.slice(0, numToAdopt);
      const remainingIds = adoptingPet.availableIds.slice(numToAdopt);

      const newAdoptionCard = {
        id: `ADOPT-${Date.now()}`,
        user: { ...formData },
        pet: { ...adoptingPet },
        adoptedIds,
        date: new Date().toLocaleDateString()
      };

      setAdoptedCards((prev) => [newAdoptionCard, ...prev]);

      setListings((prev) => {
        return prev
          .map((l) => {
            if (l.id === adoptingPet.id) {
              return { ...l, count: l.count - numToAdopt, availableIds: remainingIds };
            }
            return l;
          })
          .filter((l) => l.count > 0);
      });

      setAdoptingPet(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        training: false,
        nutritionist: false,
        adoptCount: 1
      });

      alert("Adoption application submitted successfully!");
      setView("details");
    };

    if (adoptingPet) {
      return (
        <div className="form-container fade-in" style={{ marginTop: "30px" }}>
          <div className="form-header">
            <h2>Adoption Application Form</h2>
            <p>Complete your details to finalize adopting {adoptingPet.breed}</p>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group half">
                <label>Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group half">
                <label>Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group half">
                <label>Number of Pets to Adopt:</label>
                <input
                  type="number"
                  min="1"
                  max={adoptingPet.count}
                  value={formData.adoptCount}
                  onChange={(e) => setFormData({ ...formData, adoptCount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Home Address:</label>
              <textarea
                required
                rows="3"
                placeholder="Enter your street address, city, zip code..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Additional Options:</label>
              <div className="checkbox-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.training}
                    onChange={(e) => setFormData({ ...formData, training: e.target.checked })}
                  />
                  <span>🎓 Include Pet Training Program</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.nutritionist}
                    onChange={(e) => setFormData({ ...formData, nutritionist: e.target.checked })}
                  />
                  <span>🥗 Include Pet Nutritionist Consultation</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", marginTop: "24px" }}>
              <button type="submit" className="btn submit-btn" style={{ flex: "2" }}>
                Submit Adoption Request
              </button>
              <button
                type="button"
                className="btn"
                style={{ flex: "1", backgroundColor: "#718096", color: "#fff" }}
                onClick={() => setAdoptingPet(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="fade-in">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h2>For your<br /><span className="accent">Pet Healthy</span> lifestyle</h2>
              <p>Life is easier with a furry best friend by your side. Find your new pet from our animal shelters.</p>
            </div>
            <div className="hero-image">
              <svg className="hero-doodle doodle-left" width="60" height="180" viewBox="0 0 60 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5C20 30 55 55 25 80C-5 105 30 130 10 155C0 167 5 172 8 175" stroke="#c4a6f2" strokeWidth="2.5" strokeDasharray="6 7" strokeLinecap="round" />
              </svg>
              <svg className="hero-doodle doodle-right" width="90" height="140" viewBox="0 0 90 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10C40 5 30 45 55 55C85 67 60 100 75 120C82 130 78 135 75 137" stroke="#c4a6f2" strokeWidth="2.5" strokeDasharray="6 7" strokeLinecap="round" />
              </svg>
              <svg className="hero-doodle doodle-paw" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="17" cy="24" rx="9" ry="7" stroke="#2c2c2c" strokeWidth="1.6" />
                <ellipse cx="6" cy="12" rx="3.4" ry="4.4" stroke="#2c2c2c" strokeWidth="1.6" />
                <ellipse cx="15" cy="6" rx="3.4" ry="4.6" stroke="#2c2c2c" strokeWidth="1.6" />
                <ellipse cx="24" cy="7" rx="3.4" ry="4.6" stroke="#2c2c2c" strokeWidth="1.6" />
                <ellipse cx="30" cy="15" rx="3.2" ry="4.2" stroke="#2c2c2c" strokeWidth="1.6" />
              </svg>
              <div className="hero-image-circle">
                <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=500" alt="Furry Friend" />
              </div>
            </div>
          </div>
        </div>

        <div className="section-title">
          <h2>Animals Available For<br />Adoption Near You</h2>
        </div>

        <div className="filters">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
            <option value="Bird">Birds</option>
          </select>
          <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input type="text" placeholder="Search by Age (e.g. 1 year old)" value={filterAge} onChange={(e) => setFilterAge(e.target.value)} />
        </div>

        {filteredListings.length === 0 ? (
          <div className="no-data">
            <p>No animals found matching your criteria. Please try adjusting your filters or adding animals from Manage Pets.</p>
          </div>
        ) : (
          <div className="grid">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="card dashboard-card" onClick={() => setSelectedListing(listing)}>
                <div className="card-image-bg">
                  <img src={listing.picture} alt={listing.breed} className="card-img" />
                </div>
                <div className="card-content">
                  <h3>{listing.breed}</h3>
                  <p className="card-meta">
                    {listing.age}<br />
                    {listing.gender}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedListing && (
          <div className="modal-overlay">
            <div className="modal-card">
              <button className="close-btn" onClick={() => setSelectedListing(null)}>X</button>
              <div className="modal-image-bg">
                <img src={selectedListing.picture} alt={selectedListing.breed} className="modal-img" />
              </div>

              <div className="modal-content">
                <h3>{selectedListing.breed}</h3>
                <div className="pet-stats">
                  <div className="stat"><span>Type</span><strong>{selectedListing.type}</strong></div>
                  <div className="stat"><span>Gender</span><strong>{selectedListing.gender}</strong></div>
                  <div className="stat"><span>Age</span><strong>{selectedListing.age}</strong></div>
                  <div className="stat"><span>Available</span><strong>{selectedListing.count}</strong></div>
                </div>

                <div className="adopt-form">
                  <button type="button" className="btn submit-btn" onClick={handleStartAdoption}>
                    Adopt {selectedListing.breed}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- INTERFACE 3: ADOPTION DETAILS TAB ---
  const AdoptionDetailsInterface = () => {
    return (
      <div className="fade-in" style={{ marginTop: "30px" }}>
        <div className="section-title">
          <h2>Adoption Details & Records</h2>
          <p style={{ color: "#666", marginTop: "5px" }}>
            View all submitted adoption applications and assigned pet IDs.
          </p>
        </div>

        {adoptedCards.length === 0 ? (
          <div className="no-data">
            <p>No adoptions have been completed yet.</p>
          </div>
        ) : (
          <div className="adoption-records-grid">
            {adoptedCards.map((record) => (
              <div key={record.id} className="adoption-web-card">
                <div className="record-card-image-wrap">
                  <img src={record.pet.picture} alt={record.pet.breed} className="record-card-img" />
                  <span className="record-status-badge">Confirmed Adoption</span>
                </div>

                <div className="record-card-body">
                  <div className="record-card-header">
                    <div>
                      <h3 className="record-pet-title">{record.pet.breed}</h3>
                      <p className="record-location">📍 {record.user.address} • Adopted on {record.date}</p>
                    </div>
                    <div className="record-id-tag">
                      <span>Assigned IDs</span>
                      <strong>{record.adoptedIds.join(", ")}</strong>
                    </div>
                  </div>

                  <div className="record-stats-row">
                    <div className="record-stat-chip">
                      <span>Sex</span>
                      <strong>{record.pet.gender}</strong>
                    </div>
                    <div className="record-stat-chip">
                      <span>Age</span>
                      <strong>{record.pet.age}</strong>
                    </div>
                    <div className="record-stat-chip">
                      <span>Type</span>
                      <strong>{record.pet.type}</strong>
                    </div>
                    <div className="record-stat-chip">
                      <span>Quantity</span>
                      <strong>{record.adoptedIds.length} Pet(s)</strong>
                    </div>
                  </div>

                  <div className="record-adopter-box">
                    <div className="adopter-info-main">
                      <div className="adopter-avatar-circle">
                        {record.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="adopter-label">Adopter / Main Contact</span>
                        <h4 className="adopter-name">{record.user.name}</h4>
                        <p className="adopter-details">{record.user.email} • {record.user.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="record-services-section">
                    <span className="services-label">Services Included:</span>
                    <div className="services-tags">
                      {record.user.training && <span className="service-tag">🎓 Training Program</span>}
                      {record.user.nutritionist && <span className="service-tag">🥗 Nutritionist Consultation</span>}
                      {!record.user.training && !record.user.nutritionist && <span className="service-tag empty">Standard Adoption Package</span>}
                    </div>
                  </div>

                  <div className="record-card-footer">
                    <button className="record-status-btn" disabled>
                      ✓ Adoption Record Verified
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- INTERFACE 4: PROGRESS & TRAINING TAB ---
  const ProgressInterface = () => {
    const [uploadModuleId, setUploadModuleId] = useState(TRAINING_MODULES[0].id);
    const [petName, setPetName] = useState("");
    const videoFileInputRef = useRef(null);

    // Helper: check if user uploaded a video for a specific module ID
    const isModuleVideoUploaded = (moduleId) => {
      return userVideos.some((v) => v.moduleId === moduleId);
    };

    const toggleTrainingCompletion = (moduleId) => {
      if (!isModuleVideoUploaded(moduleId)) {
        alert("Please upload a video showing your pet completing this training first!");
        return;
      }

      setCompletedTrainings((prev) => {
        if (prev.includes(moduleId)) {
          return prev.filter((id) => id !== moduleId);
        } else {
          return [...prev, moduleId];
        }
      });
    };

    const handleVideoUpload = (e) => {
      e.preventDefault();
      const file = videoFileInputRef.current?.files[0];
      if (!file) {
        alert("Please select a video file first!");
        return;
      }

      const videoUrl = URL.createObjectURL(file);
      const moduleObj = TRAINING_MODULES.find((m) => m.id === uploadModuleId);

      const newVideoRecord = {
        id: `VID-${Date.now()}`,
        moduleId: uploadModuleId,
        petName: petName || "Furry Friend",
        moduleTitle: moduleObj ? moduleObj.title : "Training Video",
        videoUrl,
        date: new Date().toLocaleDateString()
      };

      setUserVideos((prev) => [newVideoRecord, ...prev]);
      setPetName("");
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
      alert(`Video uploaded for "${moduleObj?.title}"! You can now mark this training as completed.`);
    };

    return (
      <div className="fade-in" style={{ marginTop: "30px" }}>
        <div className="section-title">
          <h2 className="progress-heading">Pet Training & Progress Tracker</h2>
          <p style={{ color: "#666", marginTop: "5px" }}>
            Watch training modules, upload your practice video, and check off the completed module to unlock achievements!
          </p>
        </div>

        {/* --- ACHIEVEMENTS BANNER --- */}
        <div className="achievements-section">
          <h3>🏆 Earned Achievements</h3>
          <div className="badges-container">
            {TRAINING_MODULES.map((module) => {
              const isUnlocked = completedTrainings.includes(module.id);
              return (
                <div
                  key={module.id}
                  className={`badge-card ${isUnlocked ? "unlocked" : "locked"}`}
                >
                  <div className="badge-icon">{isUnlocked ? "🏅" : "🔒"}</div>
                  <div className="badge-title">{module.badge}</div>
                  <span className="badge-status">
                    {isUnlocked ? "Unlocked!" : "Upload video & complete to unlock"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- VIDEO UPLOAD SECTION --- */}
        <div className="upload-step-card" style={{ marginTop: "30px" }}>
          <div className="form-header">
            <h2>Step 1: Upload Training Video</h2>
            <p>Upload proof of your pet completing a training module to unlock its completion checkmark.</p>
          </div>
          <form onSubmit={handleVideoUpload}>
            <div className="form-row">
              <div className="form-group half">
                <label>Pet's Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Milo"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group half">
                <label>Select Training Module:</label>
                <select
                  value={uploadModuleId}
                  onChange={(e) => setUploadModuleId(e.target.value)}
                >
                  {TRAINING_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Select Practice Video File:</label>
              <input
                type="file"
                accept="video/*"
                ref={videoFileInputRef}
                required
              />
            </div>

            <button type="submit" className="btn submit-btn">
              Upload Video
            </button>
          </form>
        </div>

        {/* --- TRAINING MODULES SECTION --- */}
        <div className="section-title" style={{ marginTop: "40px" }}>
          <h2 className="progress-heading">Step 2: Training Tutorials & Completion</h2>
        </div>

        <div className="training-grid">
          {TRAINING_MODULES.map((module) => {
            const isCompleted = completedTrainings.includes(module.id);
            const hasVideoUploaded = isModuleVideoUploaded(module.id);

            return (
              <div key={module.id} className="training-card">
                <div className="video-container">
                  <video controls key={module.videoUrl}>
                    <source src={module.videoUrl} type="video/mp4" />
                    Your browser does not support video play.
                  </video>
                </div>
                <div className="training-card-body">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>

                  {/* Status Helper Message */}
                  {!hasVideoUploaded && (
                    <p className="upload-warning-text">
                      ⚠️ Upload a practice video above to unlock completion.
                    </p>
                  )}

                  <label className={`checkbox-option completion-checkbox ${!hasVideoUploaded ? "disabled-checkbox" : ""}`}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      disabled={!hasVideoUploaded}
                      onChange={() => toggleTrainingCompletion(module.id)}
                    />
                    <span>
                      {isCompleted
                        ? "✅ Training Completed!"
                        : hasVideoUploaded
                          ? "Click to Mark as Completed"
                          : "Locked (Upload Video First)"}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="navbar">
        <div className="logo-section">
          <h1>PawPatrol</h1>
        </div>
        <div className="nav-middle">
          <img src="https://cdn-icons-png.flaticon.com/512/12/12144.png" alt="Paw" className="nav-paw-icon" />
          <span className="nav-tagline">Over 10,000 Happy Pets Adopted!</span>
        </div>
        <div className="nav-buttons">
          <button className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>
            Adopt a Pet
          </button>
          <button className={`nav-btn ${view === "owner" ? "active" : ""}`} onClick={() => setView("owner")}>
            Manage Pets
          </button>
          <button className={`nav-btn ${view === "details" ? "active" : ""}`} onClick={() => setView("details")}>
            Adoption Details {adoptedCards.length > 0 && `(${adoptedCards.length})`}
          </button>
          <button className={`nav-btn ${view === "progress" ? "active" : ""}`} onClick={() => setView("progress")}>
            Progress 🎓
          </button>
        </div>
      </header>

      {view === "owner" && <OwnerInterface />}
      {view === "dashboard" && <DashboardInterface />}
      {view === "details" && <AdoptionDetailsInterface />}
      {view === "progress" && <ProgressInterface />}
    </div>
  );
}