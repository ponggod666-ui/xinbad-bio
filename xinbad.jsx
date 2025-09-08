import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Image as ImageIcon,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const LS_KEY = "bioAppData_v1";
const ADMIN_KEY = "bioAppAdmin";
const ADMIN_PASS_KEY = "bioAppAdminPass";

const defaultAdminPass = "1234";

const defaultData = {
  sections: [
    {
      id: "profile",
      title: "โปรไฟล์",
      image: "",
      fields: {
        name: "Xinbad",
        title: "ตำแหน่ง/บทบาท",
        tagline: "",
        location: "",
        email: "",
        phone: "",
        about: "",
        custom: [],
      },
    },
  ],
};

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : initialValue;
      if (!parsed.sections) return initialValue;
      return parsed;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function BioApp() {
  const [data, setData] = useLocalStorageState(LS_KEY, defaultData);
  const [editing, setEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(ADMIN_KEY) === "true"
  );
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");

  const savedPass = localStorage.getItem(ADMIN_PASS_KEY) || defaultAdminPass;

  const login = () => {
    if (password === savedPass) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, "true");
      setEditing(true);
      setShowLogin(false);
      setPassword("");
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setEditing(false);
    localStorage.removeItem(ADMIN_KEY);
  };

  const updateSection = (id, newSection) => {
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === id ? newSection : s)),
    }));
  };

  const removeSection = (id) => {
    setData((d) => ({
      ...d,
      sections: d.sections.filter((s) => s.id !== id),
    }));
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    setData((d) => ({
      ...d,
      sections: [
        ...d.sections,
        { id: newId, title: "หัวข้อใหม่", image: "", fields: { custom: [] } },
      ],
    }));
  };

  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const section = data.sections.find((s) => s.id === id);
        if (section) {
          updateSection(id, { ...section, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (id, url) => {
    const section = data.sections.find((s) => s.id === id);
    if (section) {
      updateSection(id, { ...section, image: url });
    }
  };

  const removeField = (sectionId, fieldName, isCustom = false, index = null) => {
    const section = data.sections.find((s) => s.id === sectionId);
    if (section) {
      let newFields;
      if (isCustom && index !== null) {
        newFields = {
          ...section.fields,
          custom: section.fields.custom.filter((_, i) => i !== index),
        };
      } else {
        newFields = { ...section.fields, [fieldName]: "" };
      }
      updateSection(sectionId, { ...section, fields: newFields });
    }
  };

  const addCustomField = (sectionId) => {
    const section = data.sections.find((s) => s.id === sectionId);
    if (section) {
      const newFields = {
        ...section.fields,
        custom: [...(section.fields.custom || []), { label: "ใหม่", value: "" }],
      };
      updateSection(sectionId, { ...section, fields: newFields });
    }
  };

  const updateCustomField = (sectionId, index, key, newValue) => {
    const section = data.sections.find((s) => s.id === sectionId);
    if (section) {
      const updatedCustom = section.fields.custom.map((c, i) =>
        i === index ? { ...c, [key]: newValue } : c
      );
      const newFields = { ...section.fields, custom: updatedCustom };
      updateSection(sectionId, { ...section, fields: newFields });
    }
  };

  const renderFields = (section) => {
    if (section.id === "profile") {
      const f = section.fields;
      return (
        <div className="space-y-2">
          {f.name && (
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">{f.name}</div>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "name")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.title && (
            <div className="flex items-center justify-between">
              <div className="text-sm">{f.title}</div>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "title")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.tagline && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{f.tagline}</div>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "tagline")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.about && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{f.about}</p>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "about")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.location && (
            <div className="flex items-center justify-between">
              <div className="text-sm">📍 {f.location}</div>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "location")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.email && (
            <div className="flex items-center justify-between">
              <div className="text-sm">📧 {f.email}</div>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "email")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.phone && (
            <div className="flex items-center justify-between">
              <div className="text-sm">📞 {f.phone}</div>
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, "phone")}><X className="size-4"/></Button>}
            </div>
          )}
          {f.custom && f.custom.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              {editing ? (
                <>
                  <Input
                    value={c.label}
                    onChange={(e) => updateCustomField(section.id, i, "label", e.target.value)}
                    className="w-1/3"
                  />
                  <Input
                    value={c.value}
                    onChange={(e) => updateCustomField(section.id, i, "value", e.target.value)}
                    className="w-1/2"
                  />
                </>
              ) : (
                <div className="text-sm">
                  {c.label}: {/^https?:\/\//.test(c.value) ? (
                    <a href={c.value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{c.value}</a>
                  ) : (
                    c.value
                  )}
                </div>
              )}
              {editing && <Button variant="ghost" size="sm" onClick={() => removeField(section.id, null, true, i)}><X className="size-4"/></Button>}
            </div>
          ))}
          {editing && (
            <Button variant="outline" size="sm" onClick={() => addCustomField(section.id)}>+ เพิ่มฟิลด์ใหม่</Button>
          )}
        </div>
      );
    }
    return <div className="text-sm text-muted-foreground">{JSON.stringify(section.fields)}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold tracking-tight">BIO App</div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <Button
                  variant={editing ? "default" : "secondary"}
                  onClick={() => setEditing((v) => !v)}
                  className="rounded-2xl"
                >
                  {editing ? (
                    <span className="inline-flex items-center gap-2"><Unlock className="size-4"/>Editing</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Lock className="size-4"/>View</span>
                  )}
                </Button>
                <Button variant="outline" onClick={logout} className="rounded-2xl">
                  ออกจากระบบ
                </Button>
                {editing && (
                  <Button variant="secondary" onClick={addSection}>+ เพิ่มหัวข้อ</Button>
                )}
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setShowLogin(true)} className="rounded-2xl">
                  กดแก้ไขได้ เฉพาะ Admin
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Dialog สำหรับ Login */}
      {showLogin && (
        <Dialog open={showLogin} onOpenChange={setShowLogin}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เข้าสู่ระบบ Admin</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                type="password"
                placeholder="รหัสผ่าน Admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={login}>เข้าสู่ระบบ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 grid gap-6">
        {data.sections && data.sections.map((section) => (
          <motion.div key={section.id}>
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {editing ? (
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateSection(section.id, { ...section, title: e.target.value })
                      }
                    />
                  ) : (
                    <CardTitle>{section.title}</CardTitle>
                  )}
                  {editing && (
                    <>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(section.id, e)}
                        />
                        <ImageIcon className="size-4" />
                      </label>
                      <Input
                        placeholder="ใส่ลิงก์รูปภาพ"
                        onBlur={(e) => handleImageUrl(section.id, e.target.value)}
                      />
                    </>
                  )}
                </div>
                {editing && (
                  <Button variant="destructive" size="sm" onClick={() => removeSection(section.id)}>
                    ลบหัวข้อ
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {section.image && (
                  <img src={section.image} alt="section" className="mb-3 max-h-40 rounded-lg" />
                )}
                {renderFields(section)}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
