import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, LogOut, Edit2, 
  Camera, Save, X, Building, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  userId?: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  profilePicture: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    profilePicture: '',
    createdAt: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('pharmacie_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        profilePicture: user.profilePicture || '',
        createdAt: user.createdAt || '',
      });
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleSave = () => {
    const storedUser = localStorage.getItem('pharmacie_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('pharmacie_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth-change'));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pharmacie_user');
    window.dispatchEvent(new Event('auth-change'));
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const memberSince = userData.createdAt 
    ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 md:px-10 pt-10 pb-8">
            <div className="flex items-end gap-6">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-white shadow-xl border-4 border-white overflow-hidden">
                  {userData.profilePicture ? (
                    <img src={userData.profilePicture} alt={userData.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <User className="w-14 h-14 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label htmlFor="profile-picture-upload" className="absolute -bottom-1 -right-1 bg-white text-teal-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-gray-100 transition-all">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" id="profile-picture-upload" />
                  </label>
                )}
              </div>
              
              {/* Name & Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">@{userData.username || 'User'}</h1>
                <p className="text-white/80">{userData.fullName || 'Your Name'}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm font-medium border border-white/20">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl hover:bg-gray-100 transition-all text-sm font-semibold shadow-lg">
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm font-medium border border-white/20">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-semibold shadow-lg">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Form Fields */}
          <div className="px-6 md:px-10 py-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <User className="w-4 h-4 text-teal-600" /> Username
                </label>
                {isEditing ? (
                  <input type="text" value={userData.username} onChange={(e) => setUserData({ ...userData, username: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="john_doe" />
                ) : (
                  <p className="text-gray-900 font-medium">@{userData.username || 'Not set'}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <User className="w-4 h-4 text-teal-600" /> Full Name
                </label>
                {isEditing ? (
                  <input type="text" value={userData.fullName} onChange={(e) => setUserData({ ...userData, fullName: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="John Doe" />
                ) : (
                  <p className="text-gray-900 font-medium">{userData.fullName || 'Not set'}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Mail className="w-4 h-4 text-teal-600" /> Email
                </label>
                {isEditing ? (
                  <input type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="you@example.com" />
                ) : (
                  <p className="text-gray-900 font-medium">{userData.email || 'Not set'}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Phone className="w-4 h-4 text-teal-600" /> Phone
                </label>
                {isEditing ? (
                  <input type="tel" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+254 700 000 000" />
                ) : (
                  <p className="text-gray-900 font-medium">{userData.phone || 'Not set'}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Building className="w-4 h-4 text-teal-600" /> Gender
                </label>
                {isEditing ? (
                  <select value={userData.gender} onChange={(e) => setUserData({ ...userData, gender: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{userData.gender || 'Not set'}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 text-teal-600" /> Date of Birth
                </label>
                {isEditing ? (
                  <input type="date" value={userData.dateOfBirth} onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                ) : (
                  <p className="text-gray-900 font-medium">{userData.dateOfBirth || 'Not set'}</p>
                )}
              </div>

              <div className="md:col-span-2 bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-teal-600" /> Address
                </label>
                {isEditing ? (
                  <textarea value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none" rows={3} placeholder="Your address" />
                ) : (
                  <p className="text-gray-900 font-medium">{userData.address || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-400 text-sm mt-6">© 2026 Pharmacie Nouni. All rights reserved.</p>
      </div>
    </div>
  );
}