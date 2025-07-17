
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import GatedContent from "@/components/gated-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  isPremium: boolean;
  isAdmin: boolean;
  photoURL?: string;
}

const UserListTable = ({ users }: { users: UserData[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                         <TableHead>Role</TableHead>
                        <TableHead>Joined Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.displayName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.isPremium ? "default" : "outline"} className={cn(user.isPremium && "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-transparent")}>
                                    {user.isPremium ? "Premium" : "Standard"}
                                </Badge>
                            </TableCell>
                             <TableCell>
                                {user.isAdmin ? (
                                    <Badge variant="destructive">Admin</Badge>
                                ) : (
                                    <Badge variant="secondary">User</Badge>
                                )}
                            </TableCell>
                            <TableCell>{user.createdAt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);


const LoadingSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    </div>
);

export default function AdminUsersPage() {
    const { user, profile } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            if (user && profile?.isAdmin) {
                try {
                    const firestore = getFirebaseFirestore();
                    const usersCollectionRef = collection(firestore, "users");
                    const q = query(usersCollectionRef, orderBy("createdAt", "desc"));
                    const usersSnapshot = await getDocs(q);
                    
                    const fetchedUsers = usersSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const sub = data.subscription;
                        const isPremium = !!(sub?.status === 'active' && sub.endDate && new Date(sub.endDate) > new Date());
                        const isAdmin = data.isAdmin === true;

                        return {
                            id: doc.id,
                            displayName: data.displayName || "N/A",
                            email: data.email || "N/A",
                            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
                            isPremium: isPremium,
                            isAdmin: isAdmin,
                            photoURL: data.photoURL,
                        }
                    });
                    setUsers(fetchedUsers);
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                 setLoading(false);
            }
        };

        if (user !== undefined) {
            fetchUsers();
        }
    }, [user, profile]);

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-4xl font-extrabold font-headline mb-2">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground mb-8">
                Manage users and view site activity.
            </p>
            <GatedContent gateType="admin">
                 {loading ? <LoadingSkeleton /> : <UserListTable users={users} />}
            </GatedContent>
        </div>
    );
}
