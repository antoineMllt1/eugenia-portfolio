import React, { useState, useEffect } from 'react';
import {
    Shield,
    Search,
    RefreshCw,
    Trash2,
    ChevronLeft,
    Mail,
    Calendar,
    User as UserIcon,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    username: string;
    role: string;
    is_admin: boolean;
    created_at: string;
}

interface AdminDashboardProps {
    onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = async () => {
        try {
            setRefreshing(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) throw new Error('No session');

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${email} ? Cette action est irréversible.`)) {
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete user');
            }

            setUsers(users.filter(u => u.id !== userId));
            alert('Utilisateur supprimé avec succès.');
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary" />
                            Espace Administration
                        </h1>
                        <p className="text-sm text-muted-foreground">Gérez les utilisateurs de la plateforme Eugenia</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchUsers}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Rafraîchir
                </Button>
            </div>

            <Card className="p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un email, nom ou username..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Chargement des utilisateurs...</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Inscription</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                                    <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{user.full_name || 'Sans nom'}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_admin ? (
                                                <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">Admin</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">User</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(user.created_at), 'dd MMM yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!user.is_admin && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Aucun utilisateur trouvé.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>

            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <p className="text-xs text-muted-foreground italic">
                    Attention : La suppression d'un utilisateur est définitive et supprimera également toutes ses publications, commentaires et likes.
                </p>
            </div>
        </div>
    );
}
