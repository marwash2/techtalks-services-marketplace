"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProviderSidebar from "@/components/provider/ProviderSidebar";
import {Camera,MapPin,Phone,Mail,Globe,Clock3,BriefcaseBusiness,Save} from "lucide-react";

type ProviderProfile={
 businessName:string;
 fullName:string;
 email:string;
 phone:string;
 location:string;
 website:string;
 category:string;
 bio:string;
 pricing:string;
 availability:string;
};

export default function ProviderProfilePage(){
const {data:session}=useSession();

const [providerId,setProviderId]=useState("");
const [loading,setLoading]=useState(true);
const [saving,setSaving]=useState(false);

const [form,setForm]=useState<ProviderProfile>({
 businessName:"",
 fullName:"",
 email:"",
 phone:"",
 location:"",
 website:"",
 category:"",
 bio:"",
 pricing:"",
 availability:"",
});

async function fetchProfile(){
 try{
   setLoading(true);

   const res=await fetch('/api/providers');
   const data=await res.json();

   const providers=data.data?.providers || [];

   const currentProvider=providers.find(
      (p:any)=>p.userId?._id===session?.user?.id
   );

   if(!currentProvider){
      setLoading(false);
      return;
   }
   setProviderId(currentProvider._id);

   setForm({
      businessName:currentProvider.businessName||"",
      fullName:currentProvider.userId?.name||"",
      email:currentProvider.userId?.email||"",
      phone:"",
      location:currentProvider.location||"",
      website:"",
      category:"Service Provider",
      bio:currentProvider.description||"",
      pricing:"",
      availability:""
   });

 }catch(error){
   console.error(error);
 }finally{
   setLoading(false);
 }
}

useEffect(()=>{
 if(session?.user?.id){
   fetchProfile();
 }
},[session]);

function handleChange(
 e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>
){
 setForm({
   ...form,
   [e.target.name]:e.target.value
 })
}

async function handleSave(
 e:React.FormEvent
){
 e.preventDefault();
  try{
   setSaving(true);

   const res=await fetch(
      `/api/providers/${providerId}`,
      {
       method:"PUT",
       headers:{
         "Content-Type":"application/json"
       },
       body:JSON.stringify({
         businessName:form.businessName,
         description:form.bio,
         location:form.location
       })
      }
   );

   if(!res.ok){
      throw new Error("Update failed");
   }
    alert("Profile updated successfully");

 }catch(error){
   console.error(error);
 }finally{
   setSaving(false);
 }
}

if(loading){
 return <div className="p-8 text-center">Loading profile...</div>
}
return(
<div className="min-h-screen bg-slate-50 p-4 lg:p-8">
<div className="mx-auto flex max-w-7xl gap-6">

<ProviderSidebar/>

<main className="flex-1 rounded-3xl bg-white p-6 shadow-sm">

<div className="mb-8">
<h1 className="text-3xl font-bold">Edit Profile</h1>
<p className="mt-2 text-slate-500">Manage your provider information</p>
</div>

<form onSubmit={handleSave} className="space-y-8">

<section className="rounded-3xl border p-8">
<div className="flex flex-col gap-6 md:flex-row md:items-center">

<div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-4xl font-bold">
{form.fullName?.charAt(0)}

<button
 type="button"
 className="absolute bottom-1 right-1 rounded-full bg-slate-900 p-3 text-white"
>
<Camera className="h-4 w-4"/>
</button>
</div>

<div>
<h2 className="text-2xl font-semibold">{form.fullName}</h2>
<p className="mt-2 text-slate-500">{form.category}</p>
<div className="mt-4 flex gap-3 flex-wrap">
<Badge text={form.location}/>
{form.availability && <Badge text={form.availability}/>} 
</div>
</div>

</div>
</section>

<section className="rounded-3xl border p-8">
<h2 className="mb-6 text-xl font-semibold">Basic Information</h2>

<div className="grid gap-6 md:grid-cols-2">

<InputField
 label="Business Name"
 icon={<BriefcaseBusiness className="h-4 w-4"/>}
 name="businessName"
 value={form.businessName}
 onChange={handleChange}
/>

<InputField
 label="Full Name"
 name="fullName"
 value={form.fullName}
 onChange={handleChange}
/>

<InputField
 label="Email"
 icon={<Mail className="h-4 w-4"/>}
 name="email"
 value={form.email}
 onChange={handleChange}
/>

<InputField
 label="Phone"
 icon={<Phone className="h-4 w-4"/>}
 name="phone"
 value={form.phone}
 onChange={handleChange}
/>


<InputField
 label="Location"
 icon={<MapPin className="h-4 w-4"/>}
 name="location"
 value={form.location}
 onChange={handleChange}
/>

<InputField
 label="Website"
 icon={<Globe className="h-4 w-4"/>}
 name="website"
 value={form.website}
 onChange={handleChange}
/>
</div>
</section>

<section className="rounded-3xl border p-8">
<h2 className="mb-6 text-xl font-semibold">Service Details</h2>

<div className="grid gap-6 md:grid-cols-2 mb-6">

<InputField
 label="Category"
 name="category"
 value={form.category}
 onChange={handleChange}
/>

<InputField
 label="Availability"
 icon={<Clock3 className="h-4 w-4"/>}
 name="availability"
 value={form.availability}
 onChange={handleChange}
/>
</div>
<div className="mb-6">
<label className="block mb-2 text-sm font-medium">Pricing</label>
<input
 name="pricing"
 value={form.pricing}
 onChange={handleChange}
 className="w-full rounded-2xl border p-4"
/>
</div>

<div>
<label className="block mb-2 text-sm font-medium">About / Bio</label>
<textarea
 rows={5}
 name="bio"
 value={form.bio}
 onChange={handleChange}
 className="w-full rounded-2xl border p-4"
/>
</div>
</section>
<div className="flex justify-end">
<button
 disabled={saving}
 className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-white"
>
<Save className="h-4 w-4"/>
{saving ? "Saving..." : "Save Changes"}
</button>
</div>

</form>
</main>
</div>
</div>
)
}

function InputField({label,icon,...props}:any){
return(
<div>
<label className="mb-2 block text-sm font-medium">{label}</label>
<div className="relative">
{icon && (
<div className="absolute left-4 top-4 text-slate-400">
{icon}
</div>
)}
<input
 {...props}
 className={`w-full rounded-2xl border p-4 ${icon?'pl-11':''}`}
/>
</div>
</div>
)
}
function Badge({text}:{text:string}){
return(
<span className="rounded-full bg-slate-100 px-4 py-2 text-sm">
{text}
</span>
)
}