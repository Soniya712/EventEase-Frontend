"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Wifi, Car, Wind, Zap, Utensils, Music, Video, Wine,
  X, ChevronRight, Building, Home
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface VenueFormData {
  name: string;
  city: string;
  address: string;
  contact_phone: string;
  website_url: string;
  capacity: string;
  price_per_plate: string;
  description: string;
  start_time: string;
  end_time: string;
  amenities: string[];
  event_types: string[];
  email: string;
  state: string;
  zip_code: string;
  images: string[]; // existing image paths (URLs)
}

interface VenueFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

/* ---------------- COMPONENT ---------------- */

export default function VenueForm({ initialData, isEditMode = false }: VenueFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<VenueFormData>({
    name: "",
    city: "",
    address: "",
    contact_phone: "",
    website_url: "",
    capacity: "",
    price_per_plate: "",
    description: "",
    start_time: "09:00",
    end_time: "23:00",
    amenities: [],
    event_types: [],
    email: "",
    state: "",
    zip_code: "",
    images: [],
  });

  /* ---------------- OPTIONS ---------------- */

  const amenityOptions = [
    { id: "wifi", label: "WiFi", icon: <Wifi size={20} /> },
    { id: "parking", label: "Parking", icon: <Car size={20} /> },
    { id: "ac", label: "Air Conditioning", icon: <Wind size={20} /> },
    { id: "generator", label: "Generator", icon: <Zap size={20} /> },
    { id: "catering", label: "Catering", icon: <Utensils size={20} /> },
    { id: "sound_system", label: "Sound System", icon: <Music size={20} /> },
    { id: "projector", label: "Projector", icon: <Video size={20} /> },
    { id: "bar", label: "Bar Service", icon: <Wine size={20} /> },
  ];

  const eventTypeOptions = [
    "Wedding", "Corporate", "Birthday", "Conference",
    "Party", "Seminar", "Exhibition", "Workshop"
  ];

  /* ---------------- LOAD EDIT DATA ---------------- */

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        city: initialData.city || "",
        address: initialData.address || "",
        contact_phone: initialData.contact_phone || "",
        website_url: initialData.website_url || "",
        capacity: String(initialData.capacity || ""),
        price_per_plate: String(initialData.price_per_plate || ""),
        description: initialData.description || "",
        start_time: initialData.start_time || "09:00",
        end_time: initialData.end_time || "23:00",
        amenities: initialData.amenities || [],
        event_types: initialData.event_types || [],
        email: initialData.email || "",
        state: initialData.state || "",
        zip_code: initialData.zip_code || "",
        images: initialData.images || [],
      });

      setPreviewImages(initialData.images || []);
    }
  }, [initialData]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAmenityChange = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const toggleEventType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      event_types: prev.event_types.includes(type)
        ? prev.event_types.filter(t => t !== type)
        : [...prev.event_types, type]
    }));
  };

  /* ---------------- IMAGE LOGIC ---------------- */

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setFilesToUpload(prev => [...prev, ...newFiles]);

    const previews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previews]);
  };

  const handleImageUpload = (e: any) => processFiles(e.target.files);
  const handleDrop = (e: any) => { e.preventDefault(); processFiles(e.dataTransfer.files); };
  const handleDragOver = (e: any) => e.preventDefault();

  const removeImage = (index: number) => {
    const existingCount = formData.images.length;

    if (index < existingCount) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      const fileIndex = index - existingCount;
      setFilesToUpload(prev => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });

      filesToUpload.forEach(file => {
        data.append("new_images[]", file);
      });

      if (isEditMode) {
        data.append("_method", "PUT");
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/owner/venues/${initialData.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/owner/venues`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      router.push("/owner/venues");
    } catch (error) {
      console.error(error);
      alert("Error saving venue");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2 text-sm">
          <button onClick={() => router.push("/owner/dashboard")} className="flex items-center gap-1">
            <Home size={14}/> Dashboard
          </button>
          <ChevronRight size={14}/>
          <button onClick={() => router.push("/owner/venues")} className="flex items-center gap-1">
            <Building size={14}/> Venues
          </button>
          <ChevronRight size={14}/>
          <span>{isEditMode ? "Edit Venue" : "Add Venue"}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold">{isEditMode ? "Update Venue" : "Create Venue"}</h1>
          <p className="text-blue-200 mt-2">Step {step} of 3</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Venue Details</h2>

              <input name="name" value={formData.name} onChange={handleChange}
                placeholder="Venue Name" className="w-full p-3 border rounded-xl mb-4" required />

              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Description" rows={4} className="w-full p-3 border rounded-xl mb-4" required />

              <div className="grid grid-cols-2 gap-4">
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="p-3 border rounded-xl" required />
                <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="p-3 border rounded-xl" required />
                <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="Contact Phone" className="p-3 border rounded-xl" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded-xl" required />
                <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} placeholder="Capacity" className="p-3 border rounded-xl" required />
                <input name="price_per_plate" type="number" value={formData.price_per_plate} onChange={handleChange} placeholder="Price per plate" className="p-3 border rounded-xl" required />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenityOptions.map(opt => (
                  <button type="button" key={opt.id}
                    onClick={() => handleAmenityChange(opt.id)}
                    className={`p-4 border rounded-xl ${formData.amenities.includes(opt.id) ? "bg-blue-600 text-white" : "bg-gray-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-bold mt-6 mb-4">Event Types</h2>
              <div className="flex flex-wrap gap-2">
                {eventTypeOptions.map(type => (
                  <button type="button" key={type}
                    onClick={() => toggleEventType(type)}
                    className={`px-4 py-2 rounded-full border ${formData.event_types.includes(type) ? "bg-blue-600 text-white" : "bg-gray-50"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Upload Images</h2>

              <div onDrop={handleDrop} onDragOver={handleDragOver}
                className="border-2 border-dashed p-8 text-center rounded-xl">
                <input type="file" multiple onChange={handleImageUpload} id="fileInput" className="hidden" />
                <label htmlFor="fileInput" className="cursor-pointer text-blue-600 font-bold">
                  Click or drag images here
                </label>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                {previewImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} className="h-32 w-full object-cover rounded-xl" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-between bg-white p-6 rounded-2xl shadow">
            <button type="button" onClick={handlePrevStep}
              className={`px-6 py-3 border rounded-xl ${step === 1 ? "invisible" : ""}`}>
              Previous
            </button>

            <button type="submit" disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">
              {loading ? "Saving..." : step < 3 ? "Next" : isEditMode ? "Update Venue" : "Publish Venue"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
