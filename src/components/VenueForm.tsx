"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { X, Upload, Plus, Trash2 } from "lucide-react";

interface VenueFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

const PREDEFINED_AMENITIES = [
  "wifi", "parking", "sound_system", "ac", "catering", "decoration",
  "stage", "changing_room", "dj", "bar", "smoking_area", "valet_parking",
  "wheelchair_access", "security",
];

export default function VenueForm({ initialData, isEditMode = false }: VenueFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    contact_phone: "",
    email: "",
    capacity: "",
    price_per_plate: "",
    hall_cost: "",
    description: "",
    amenities: [] as string[],
    event_types: [] as string[],
  });

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Documents
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);

  // Cost breakdown
  const [estimatedGuests, setEstimatedGuests] = useState(100);

  // Temporary inputs
  const [newAmenity, setNewAmenity] = useState("");
  const [newEventType, setNewEventType] = useState("");

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData({
        name: initialData.name || "",
        city: initialData.city || "",
        state: initialData.state || "",
        address: initialData.address || "",
        contact_phone: initialData.contact_phone || "",
        email: initialData.email || "",
        capacity: initialData.capacity?.toString() || "",
        price_per_plate: initialData.price_per_plate?.toString() || "",
        hall_cost: initialData.hall_cost?.toString() || "",
        description: initialData.description || "",
        amenities: initialData.amenities || [],
        event_types: initialData.event_types || [],
      });
      setExistingImages(initialData.images || []);
      setExistingDocuments(initialData.documents || []);
    }
  }, [initialData, isEditMode]);

  // Amenities
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addCustomAmenity = () => {
    const trimmed = newAmenity.trim().toLowerCase().replace(/\s+/g, '_');
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData({ ...formData, amenities: [...formData.amenities, trimmed] });
      setNewAmenity("");
    }
  };
  const removeAmenity = (item: string) => {
    setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== item) });
  };

  // Event Types
  const addEventType = () => {
    const trimmed = newEventType.trim().replace(/\s+/g, ' ');
    if (trimmed && !formData.event_types.includes(trimmed)) {
      setFormData({ ...formData, event_types: [...formData.event_types, trimmed] });
      setNewEventType("");
    }
  };
  const removeEventType = (item: string) => {
    setFormData({ ...formData, event_types: formData.event_types.filter((e) => e !== item) });
  };

  // Images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
    }
  };
  const removeImage = (index: number, isExisting: boolean, existingIndex?: number) => {
    if (isExisting && existingIndex !== undefined) {
      setExistingImages(existingImages.filter((_, i) => i !== existingIndex));
    } else {
      setImageFiles(imageFiles.filter((_, i) => i !== index));
    }
  };

  // Documents
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentFiles([...documentFiles, ...Array.from(e.target.files)]);
    }
  };
  const removeExistingDocument = (index: number) => {
    setExistingDocuments(existingDocuments.filter((_, i) => i !== index));
  };
  const removeNewDocument = (index: number) => {
    setDocumentFiles(documentFiles.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      // Basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });

      // Images
      imageFiles.forEach((file) => {
        data.append("new_images[]", file);
      });
      data.append("images", JSON.stringify(existingImages));

      // Documents
      documentFiles.forEach((file) => {
        data.append("new_documents[]", file);
      });
      data.append("documents", JSON.stringify(existingDocuments));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (isEditMode) {
        data.append("_method", "PUT");
        await axios.post(`${apiUrl}/owner/venues/${initialData.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/owner/venues`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      router.push("/owner/venues");
    } catch (error) {
      console.error(error);
      alert("Error saving venue");
    } finally {
      setLoading(false);
    }
  };

  const hallCost = Number(formData.hall_cost) || 0;
  const pricePerPlate = Number(formData.price_per_plate) || 0;
  const cateringTotal = pricePerPlate * estimatedGuests;
  const totalEstimate = hallCost + cateringTotal;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
          <input type="tel" required value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (persons)</label>
          <input type="number" min="0" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
      </div>

      {/* Pricing */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Cost Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Plate (NPR)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">NPR</span>
              <input type="number" min="0" step="100" value={formData.price_per_plate} onChange={(e) => setFormData({ ...formData, price_per_plate: e.target.value })} className="pl-12 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="e.g., 1200" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Hall Cost (fixed rental fee)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">NPR</span>
              <input type="number" min="0" step="1000" value={formData.hall_cost} onChange={(e) => setFormData({ ...formData, hall_cost: e.target.value })} className="pl-12 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="e.g., 50000" />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">📊 Cost Breakdown Estimator</h4>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Number of Guests (estimate)</label>
            <input type="number" min="1" value={estimatedGuests} onChange={(e) => setEstimatedGuests(Number(e.target.value))} className="w-40 rounded-md border border-gray-300 px-3 py-1" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Venue Hall Cost:</span><span className="font-medium">NPR {hallCost.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Price per Plate:</span><span className="font-medium">NPR {pricePerPlate.toLocaleString()}</span></div>
            <div className="flex justify-between border-t pt-1 mt-1"><span>Catering Total ({estimatedGuests} guests):</span><span>NPR {cateringTotal.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-base pt-1"><span>Total Estimated Cost:</span><span className="text-blue-700">NPR {totalEstimate.toLocaleString()}</span></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">*This is an estimate. Final cost depends on actual attendance and additional services.</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Common amenities (click to toggle):</p>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_AMENITIES.map((amenity) => (
              <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${formData.amenities.includes(amenity) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {amenity.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <input type="text" value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())} className="flex-1 rounded-md border border-gray-300 px-3 py-1" placeholder="Add custom amenity (e.g., outdoor_space)" />
          <button type="button" onClick={addCustomAmenity} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"><Plus size={18} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.amenities.map((item) => (
            <span key={item} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
              {item.replace(/_/g, ' ')}
              <button type="button" onClick={() => removeAmenity(item)} className="ml-1 text-blue-600 hover:text-blue-800"><X size={14} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Event Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Types</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.event_types.map((item) => (
            <span key={item} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
              {item}
              <button type="button" onClick={() => removeEventType(item)} className="ml-1 text-green-600 hover:text-green-800"><X size={14} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newEventType} onChange={(e) => setNewEventType(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEventType())} className="flex-1 rounded-md border border-gray-300 px-3 py-1" placeholder="e.g., Wedding, Birthday, Corporate Event" />
          <button type="button" onClick={addEventType} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"><Plus size={18} /></button>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="imageUpload" />
          <label htmlFor="imageUpload" className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"><Upload size={20} /> Upload Images</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {existingImages.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} alt="Venue" className="w-full h-32 object-cover rounded-lg" />
              <button type="button" onClick={() => removeImage(idx, true, idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
            </div>
          ))}
          {imageFiles.map((file, idx) => (
            <div key={idx} className="relative group">
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              <button type="button" onClick={() => removeImage(idx, false)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Official Documents (License, Registration, etc.)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentChange} className="hidden" id="documentUpload" />
          <label htmlFor="documentUpload" className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"><Upload size={20} /> Upload Documents (PDF, JPG, PNG)</label>
        </div>

        {existingDocuments.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Existing Documents:</p>
            <div className="space-y-2">
              {existingDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <a href={`${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">
                    {doc.split('/').pop()}
                  </a>
                  <button type="button" onClick={() => removeExistingDocument(idx)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {documentFiles.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">New Documents:</p>
            <div className="space-y-2">
              {documentFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <button type="button" onClick={() => removeNewDocument(idx)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : isEditMode ? "Update Venue" : "Create Venue"}</button>
      </div>
    </form>
  );
}