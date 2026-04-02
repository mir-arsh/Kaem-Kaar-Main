import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, MapPin, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_COORDS = { lat: 34.0837, lng: 74.7973 };

const DraggableMarker = ({ coords, setCoords }) => {
  useMapEvents({
    click(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <Marker
      position={[coords.lat, coords.lng]}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          setCoords({ lat, lng });
        },
      }}
    />
  );
};

const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [pay, setPay] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [locating, setLocating] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Location updated!");
      },
      () => {
        toast.error("Could not get your location");
        setLocating(false);
      },
    );
  };

  const handlePost = async () => {
    if (!title || !location || !pay || !date) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("jobs").insert({
      hirer_id: user.id,
      title,
      description,
      location_name: location,
      latitude: coords.lat,
      longitude: coords.lng,
      pay_amount: Number(pay),
      job_date: date,
      status: "open",
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Job posted!");
      navigate("/");
    }
  };

  return (
    <AppShell
      header={<h2 className="font-bold text-foreground">Post a Job</h2>}
    >
      <div className="px-4 py-6 space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Job Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="e.g. Need a plumber"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl min-h-[100px]"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Area Name
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="e.g. Lal Chowk, Rajbagh"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Pin Exact Location
            </label>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-xs font-bold text-primary disabled:opacity-50"
            >
              <LocateFixed size={13} />
              {locating ? "Locating..." : "Use my location"}
            </button>
          </div>

          <div className="h-56 w-full rounded-2xl overflow-hidden border border-border">
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              key={`${coords.lat}-${coords.lng}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <DraggableMarker coords={coords} setCoords={setCoords} />
            </MapContainer>
          </div>

          <p className="text-[10px] text-muted-foreground italic text-center flex items-center justify-center gap-1">
            <MapPin size={10} /> Tap map to move pin · or drag the marker
          </p>

          <div className="flex gap-2 text-[10px] font-mono text-muted-foreground justify-center">
            <span>Lat: {coords.lat.toFixed(5)}</span>
            <span>·</span>
            <span>Lng: {coords.lng.toFixed(5)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Pay Offered (₹)
          </label>
          <Input
            type="number"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            className="h-14 rounded-xl"
            placeholder="500"
          />
        </div>

        <Button
          onClick={handlePost}
          disabled={loading}
          className="w-full h-14 rounded-xl text-base font-black"
        >
          {loading ? "Posting..." : "Post Job"}
          <ArrowRight size={18} />
        </Button>
      </div>
    </AppShell>
  );
};

export default PostJobPage;
