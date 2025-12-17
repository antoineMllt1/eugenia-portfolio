import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ArrowLeft, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

interface AdminDashboardProps {
    onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Non authentifié");

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://skrgsehlhzuchrfftdul.supabase.co'}/functions/v1/admin-users`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || "Une erreur est survenue lors du chargement des utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background min-h-screen text-foreground p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
                        </div>
                        <p className="text-muted-foreground ml-11">
                            Gérez les utilisateurs et les permissions de la plateforme.
                        </p>
                    </div>
                    <Button onClick={fetchUsers} variant="outline" disabled={loading}>
                        Actualiser
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                                Utilisateurs ({users.length})
                            </CardTitle>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Rechercher..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : error ? (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md flex items-center gap-3">
                                    <ShieldAlert className="w-5 h-5" />
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <div className="relative w-full overflow-auto">
                                        <table className="w-full caption-bottom text-sm">
                                            <thead className="[&_tr]:border-b">
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Utilisateur</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rôle</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Inscrit le</th>
                                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {filteredUsers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                            Aucun utilisateur trouvé
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredUsers.map((user) => (
                                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                            <td className="p-4 align-middle font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="w-8 h-8">
                                                                        <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span>{user.full_name || 'Utilisateur inconnu'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-middle">{user.email}</td>
                                                            <td className="p-4 align-middle">
                                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-primary' : ''}>
                                                                    {user.role}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 align-middle">
                                                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                                                            </td>
                                                            <td className="p-4 align-middle text-right">
                                                                <Button variant="ghost" size="sm" disabled>
                                                                    Modifier
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
