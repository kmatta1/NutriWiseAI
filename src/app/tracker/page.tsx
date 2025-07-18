
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dumbbell, HeartPulse, Ruler, Camera, BookOpen, PlusCircle, Trash2, Crown, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import GatedContent from "@/components/gated-content";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseFirestore } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

type LogType = "strength" | "endurance" | "measurements" | "photos" | "journal";

interface BaseLog {
  id: string;
  uid: string;
  createdAt: any;
  date: string;
}
interface StrengthLog extends BaseLog { type: "strength"; exercise: string; weight: number; reps: number; sets: number; }
interface EnduranceLog extends BaseLog { type: "endurance"; activity: string; duration: number; distance: number; }
interface MeasurementLog extends BaseLog { type: "measurements"; part: string; measurement: number; unit: string; }
interface PhotoLog extends BaseLog { type: "photos"; photoUrl: string; notes: string; }
interface JournalEntry extends BaseLog { type: "journal"; entry: string; }
type AllLogTypes = StrengthLog | EnduranceLog | MeasurementLog | PhotoLog | JournalEntry;


const TrackerPreview = () => (
    <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline">
                Fitness Journey Tracker
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Log your progress to stay motivated, visualize your gains, and see how far you've come.
            </p>
        </div>

        <div className="relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg p-8">
                 <h3 className="text-2xl font-bold mb-4 text-center">Unlock Your Full Fitness Dashboard</h3>
                 <p className="text-muted-foreground text-center mb-6">Track strength, cardio, measurements, photos, and journal entries to get a complete picture of your transformation.</p>
                 <Button asChild size="lg" variant="premium">
                    <Link href="/subscribe"><Crown className="mr-2"/> Upgrade to Premium to Track</Link>
                 </Button>
            </div>

            <Tabs defaultValue="strength" className="w-full opacity-50 select-none pointer-events-none">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                    <TabsTrigger value="strength"><Dumbbell className="mr-2"/> Strength</TabsTrigger>
                    <TabsTrigger value="endurance"><HeartPulse className="mr-2"/> Endurance</TabsTrigger>
                    <TabsTrigger value="measurements"><Ruler className="mr-2"/> Measurements</TabsTrigger>
                    <TabsTrigger value="photos"><Camera className="mr-2"/> Photos</TabsTrigger>
                    <TabsTrigger value="journal"><BookOpen className="mr-2"/> Journal</TabsTrigger>
                </TabsList>

                <TabsContent value="strength">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline"><Dumbbell /> Strength & Performance</CardTitle>
                            <CardDescription>Log the weights you lift to see your strength improve over time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                                <Input disabled className="md:col-span-2" placeholder="Exercise (e.g., Bench Press)" />
                                <Input disabled type="number" placeholder="Weight (lbs)" />
                                <Input disabled type="number" placeholder="Reps" />
                                <div className="flex gap-2">
                                  <Input disabled type="number" placeholder="Sets" />
                                  <Button disabled size="icon"><PlusCircle /></Button>
                                </div>
                            </div>
                            <Table>
                                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Exercise</TableHead><TableHead>Weight</TableHead><TableHead>Reps</TableHead><TableHead>Sets</TableHead></TableRow></TableHeader>
                                <TableBody><TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Upgrade to log your strength workouts.</TableCell></TableRow></TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    </div>
);


export default function TrackerPage() {
  const { user, loading: authLoading, profile } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AllLogTypes[]>([]);
  const [loading, setLoading] = useState(true);

  const [strengthForm, setStrengthForm] = useState({ exercise: '', weight: '', reps: '', sets: '' });
  const [enduranceForm, setEnduranceForm] = useState({ activity: '', duration: '', distance: '' });
  const [measurementForm, setMeasurementForm] = useState({ part: '', measurement: '', unit: 'in' });
  const [photoForm, setPhotoForm] = useState({ photoUrl: '', notes: '' });
  const [journalForm, setJournalForm] = useState({ entry: '' });

  const fetchLogs = useCallback(async () => {
    if (!user || !profile?.isPremium) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
        const firestore = getFirebaseFirestore();
        const logsCollectionRef = collection(firestore, `users/${user.uid}/tracker-logs`);
        const q = query(logsCollectionRef, orderBy("createdAt", "desc"));
        const logsSnapshot = await getDocs(q);
        const fetchedLogs = logsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: new Date(doc.data().createdAt?.seconds * 1000).toLocaleDateString('en-US')
        })) as AllLogTypes[];
        setLogs(fetchedLogs);
    } catch (error) {
        console.error("Error fetching tracker logs:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch your logs."});
    } finally {
        setLoading(false);
    }
  }, [user, profile?.isPremium, toast]);

  useEffect(() => {
    if (!authLoading) {
        fetchLogs();
    }
  }, [authLoading, fetchLogs]);

  const addLog = async (logType: LogType, data: Omit<AllLogTypes, 'id' | 'uid' | 'createdAt' | 'date'>) => {
      if (!user) return;
      const firestore = getFirebaseFirestore();
      try {
        await addDoc(collection(firestore, `users/${user.uid}/tracker-logs`), {
            ...data,
            type: logType,
            uid: user.uid,
            createdAt: serverTimestamp()
        });
        toast({ title: "Log Added", description: "Your progress has been saved."});
        fetchLogs(); // Refresh logs
        return true;
      } catch (error) {
        console.error("Error adding log:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save your log."});
        return false;
      }
  };
  
  const removeLog = async (id: string) => {
    if (!user) return;
    const firestore = getFirebaseFirestore();
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/tracker-logs`, id));
        toast({ title: "Log Removed", description: "The entry has been deleted."});
        setLogs(logs.filter(log => log.id !== id));
    } catch (error) {
        console.error("Error removing log:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete the log."});
    }
  };

  const handleAddStrengthLog = async () => {
    if (strengthForm.exercise && strengthForm.weight && strengthForm.reps && strengthForm.sets) {
      const success = await addLog("strength", { type: "strength", exercise: strengthForm.exercise, weight: parseFloat(strengthForm.weight), reps: parseInt(strengthForm.reps, 10), sets: parseInt(strengthForm.sets, 10) });
      if (success) setStrengthForm({ exercise: '', weight: '', reps: '', sets: '' });
    }
  };
  
  const handleAddEnduranceLog = async () => {
    if (enduranceForm.activity && enduranceForm.duration) {
      const success = await addLog("endurance", { type: "endurance", activity: enduranceForm.activity, duration: parseFloat(enduranceForm.duration), distance: parseFloat(enduranceForm.distance) || 0 });
      if (success) setEnduranceForm({ activity: '', duration: '', distance: '' });
    }
  };

  const handleAddMeasurementLog = async () => {
     if (measurementForm.part && measurementForm.measurement) {
      const success = await addLog("measurements", { type: "measurements", part: measurementForm.part, measurement: parseFloat(measurementForm.measurement), unit: measurementForm.unit });
      if (success) setMeasurementForm({ part: '', measurement: '', unit: 'in' });
    }
  };

  const handleAddPhotoLog = async () => {
    if (photoForm.photoUrl) {
       const success = await addLog("photos", { type: "photos", photoUrl: photoForm.photoUrl, notes: photoForm.notes });
      if (success) setPhotoForm({ photoUrl: '', notes: '' });
    }
  };

  const handleAddJournalEntry = async () => {
    if (journalForm.entry) {
      const success = await addLog("journal", { type: "journal", entry: journalForm.entry });
      if (success) setJournalForm({ entry: '' });
    }
  };
  
  if (authLoading || loading) {
    return (
        <div className="container mx-auto py-12 px-4 flex justify-center items-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <GatedContent gateType="premium" previewComponent={<TrackerPreview />}>
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline">
                Fitness Journey Tracker
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Log your progress to stay motivated, visualize your gains, and see how far you've come.
                </p>
            </div>

            <Tabs defaultValue="strength" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="strength"><Dumbbell className="mr-2"/> Strength</TabsTrigger>
                <TabsTrigger value="endurance"><HeartPulse className="mr-2"/> Endurance</TabsTrigger>
                <TabsTrigger value="measurements"><Ruler className="mr-2"/> Measurements</TabsTrigger>
                <TabsTrigger value="photos"><Camera className="mr-2"/> Photos</TabsTrigger>
                <TabsTrigger value="journal"><BookOpen className="mr-2"/> Journal</TabsTrigger>
                </TabsList>

                <TabsContent value="strength">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Dumbbell /> Strength & Performance</CardTitle>
                    <CardDescription>Log the weights you lift to see your strength improve over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                        <Input className="md:col-span-2" placeholder="Exercise (e.g., Bench Press)" value={strengthForm.exercise} onChange={e => setStrengthForm({...strengthForm, exercise: e.target.value})} />
                        <Input type="number" placeholder="Weight (lbs)" value={strengthForm.weight} onChange={e => setStrengthForm({...strengthForm, weight: e.target.value})} />
                        <Input type="number" placeholder="Reps" value={strengthForm.reps} onChange={e => setStrengthForm({...strengthForm, reps: e.target.value})}/>
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Sets" value={strengthForm.sets} onChange={e => setStrengthForm({...strengthForm, sets: e.target.value})}/>
                          <Button onClick={handleAddStrengthLog} size="icon"><PlusCircle /></Button>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead><TableHead>Exercise</TableHead><TableHead>Weight (lbs)</TableHead><TableHead>Reps</TableHead><TableHead>Sets</TableHead><TableHead className="text-right"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {logs.filter(l => l.type === 'strength').length > 0 ? logs.filter((l): l is StrengthLog => l.type === 'strength').map(log => (
                            <TableRow key={log.id}>
                            <TableCell>{log.date}</TableCell><TableCell className="font-medium">{log.exercise}</TableCell><TableCell>{log.weight}</TableCell><TableCell>{log.reps}</TableCell><TableCell>{log.sets}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeLog(log.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No strength logs yet.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                </TabsContent>
                
                <TabsContent value="endurance">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><HeartPulse /> Endurance & Cardio</CardTitle>
                    <CardDescription>Record your cardio sessions to track improvements in your cardiovascular health.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
                        <Input className="sm:col-span-2" placeholder="Activity (e.g., Running)" value={enduranceForm.activity} onChange={e => setEnduranceForm({...enduranceForm, activity: e.target.value})}/>
                        <Input type="number" placeholder="Duration (mins)" value={enduranceForm.duration} onChange={e => setEnduranceForm({...enduranceForm, duration: e.target.value})} />
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Distance (miles)" value={enduranceForm.distance} onChange={e => setEnduranceForm({...enduranceForm, distance: e.target.value})} />
                          <Button onClick={handleAddEnduranceLog} size="icon"><PlusCircle /></Button>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead><TableHead>Activity</TableHead><TableHead>Duration (mins)</TableHead><TableHead>Distance (miles)</TableHead><TableHead className="text-right"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {logs.filter(l => l.type === 'endurance').length > 0 ? logs.filter((l): l is EnduranceLog => l.type === 'endurance').map(log => (
                            <TableRow key={log.id}>
                            <TableCell>{log.date}</TableCell><TableCell className="font-medium">{log.activity}</TableCell><TableCell>{log.duration}</TableCell><TableCell>{log.distance}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeLog(log.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No endurance logs yet.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                </TabsContent>
                
                <TabsContent value="measurements">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Ruler /> Body Measurements</CardTitle>
                    <CardDescription>Track key body measurements for a clear picture of physical change.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
                        <Input className="sm:col-span-2" placeholder="Body Part (e.g., Bicep)" value={measurementForm.part} onChange={e => setMeasurementForm({...measurementForm, part: e.target.value})} />
                        <Input type="number" placeholder="Measurement" value={measurementForm.measurement} onChange={e => setMeasurementForm({...measurementForm, measurement: e.target.value})} />
                         <div className="flex gap-2">
                          <Input placeholder="Unit (in/cm)" value={measurementForm.unit} onChange={e => setMeasurementForm({...measurementForm, unit: e.target.value})} />
                          <Button onClick={handleAddMeasurementLog} size="icon"><PlusCircle /></Button>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead><TableHead>Body Part</TableHead><TableHead>Measurement</TableHead><TableHead className="text-right"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {logs.filter(l => l.type === 'measurements').length > 0 ? logs.filter((l): l is MeasurementLog => l.type === 'measurements').map(log => (
                            <TableRow key={log.id}>
                            <TableCell>{log.date}</TableCell><TableCell className="font-medium">{log.part}</TableCell><TableCell>{log.measurement} {log.unit}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeLog(log.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No measurements logged yet.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="photos">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Camera /> Progress Photos</CardTitle>
                    <CardDescription>A picture is worth a thousand words. Visually track your transformation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Input className="flex-grow" placeholder="Paste Image URL here..." value={photoForm.photoUrl} onChange={e => setPhotoForm({...photoForm, photoUrl: e.target.value})}/>
                        <Input className="flex-grow" placeholder="Notes (optional)" value={photoForm.notes} onChange={e => setPhotoForm({...photoForm, notes: e.target.value})}/>
                        <Button onClick={handleAddPhotoLog}><PlusCircle className="mr-2"/> Add Photo</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {logs.filter(l => l.type === 'photos').length > 0 ? logs.filter((l): l is PhotoLog => l.type === 'photos').map(log => (
                        <Card key={log.id} className="relative group overflow-hidden">
                            <Image src={log.photoUrl} alt={`Progress photo from ${log.date}`} className="rounded-t-lg object-cover aspect-square w-full" width={300} height={300} />
                            <div className="p-4">
                            <p className="font-semibold">{log.date}</p>
                            <p className="text-sm text-muted-foreground">{log.notes}</p>
                            </div>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeLog(log.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </Card>
                        )) : <div className="col-span-full text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">No photos uploaded yet. Paste an image URL to get started.</div>}
                    </div>
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="journal">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><BookOpen /> Daily Journal</CardTitle>
                    <CardDescription>Note your energy levels, recovery, and how daily activities feel. This is key to understanding progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-col gap-2 mb-4">
                        <Textarea placeholder="How are you feeling today? Noticed any changes in energy, stability, or mood?" value={journalForm.entry} onChange={e => setJournalForm({entry: e.target.value})} rows={4}/>
                        <Button onClick={handleAddJournalEntry} className="self-end"><PlusCircle className="mr-2"/> Add Entry</Button>
                    </div>
                    <div className="space-y-4">
                        {logs.filter(l => l.type === 'journal').length > 0 ? logs.filter((l): l is JournalEntry => l.type === 'journal').map(entry => (
                        <Card key={entry.id} className="p-4 relative group bg-secondary/30">
                            <p className="text-sm font-bold text-foreground">{entry.date}</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{entry.entry}</p>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeLog(entry.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </Card>
                        )) : <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">No journal entries yet.</div>}
                    </div>
                    </CardContent>
                </Card>
                </TabsContent>

            </Tabs>
        </div>
    </GatedContent>
  );
}

    