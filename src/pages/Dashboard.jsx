import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Code2, 
  Calendar, 
  Edit3, 
  Trash2, 
  Play, 
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Home
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import { getSavedAlgorithms, saveAlgorithm, deleteAlgorithm } from "@/lib/storage";
import { examples } from "@/lib/examples";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();
  const [savedAlgorithms, setSavedAlgorithms] = useState([]); // legacy local (kept for compatibility)
  const [dbAlgorithms, setDbAlgorithms] = useState([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAlgorithm, setNewAlgorithm] = useState({
    title: "",
    code: `// New algorithm\nfunction myAlgorithm() {\n  api.enter('myAlgorithm', {});\n  // Your code here\n  api.exit();\n}\n\nmyAlgorithm();`,
    language: "javascript"
  });

  useEffect(() => {
    setSavedAlgorithms(getSavedAlgorithms());
  }, []);

  useEffect(() => {
    const loadDbAlgorithms = async () => {
      if (!isAuthenticated) return;
      setIsLoadingDb(true);
      try {
        const url = `${API_BASE_URL}/algorithms?author=${user.id}&limit=50`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load algorithms');
        const list = Array.isArray(data.algorithms) ? data.algorithms : [];
        const key = 'recursion_explorer_bookmarked_algorithms';
        const bookmarkedIds = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
        setDbAlgorithms(list.map(a => ({ ...a, __bookmarked: bookmarkedIds.has(a._id) })));
      } catch (e) {
        
      } finally {
        setIsLoadingDb(false);
      }
    };
    loadDbAlgorithms();
  }, [isAuthenticated, token, user]);

  const handleCreateAlgorithm = () => {
    if (!newAlgorithm.title.trim()) return;
    
    const saved = saveAlgorithm(newAlgorithm);
    setSavedAlgorithms(prev => [...prev, saved]);
    setNewAlgorithm({
      title: "",
      code: `// New algorithm\nfunction myAlgorithm() {\n  api.enter('myAlgorithm', {});\n  // Your code here\n  api.exit();\n}\n\nmyAlgorithm();`,
      language: "javascript"
    });
    setIsCreateModalOpen(false);
  };

  const handleDeleteAlgorithm = async (id) => {
    // Try backend deletion first; fallback to local storage id
    try {
      const res = await fetch(`${API_BASE_URL}/algorithms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDbAlgorithms(prev => prev.filter(a => a._id !== id));
        return;
      }
    } catch (e) {
      // ignore and try local delete
    }
    if (deleteAlgorithm(id)) {
      setSavedAlgorithms(prev => prev.filter(algo => algo.id !== id));
    }
  };

  const handleOpenDbAlgorithm = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/algorithms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to open algorithm');
      const algo = data.algorithm;
      const localId = `db-${algo._id}`;
      saveAlgorithm({
        id: localId,
        title: algo.title,
        code: algo.code,
        language: algo.language,
        createdAt: algo.createdAt,
        updatedAt: algo.updatedAt
      });
      navigate(`/playground?custom=${localId}`);
    } catch (e) {}
  };

  const toggleDbBookmark = (id) => {
    const key = 'recursion_explorer_bookmarked_algorithms';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    localStorage.setItem(key, JSON.stringify(current));
    setDbAlgorithms(prev => prev.map(a => a._id === id ? { ...a, __bookmarked: idx === -1 } : a));
  };

  

  const filteredDbAlgorithms = dbAlgorithms.filter(algo => 
    (algo.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || (algo.category || 'Custom') === filterCategory)
  );

  // bookmarks removed

  return (
    <>
      <Seo
        title="Dashboard | Recursion Explorer"
        description="Manage your saved algorithms, bookmarks, and create new visualizations."
        canonical="/dashboard"
      />
      <main className="container mx-auto py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Algorithm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Algorithm</DialogTitle>
                  <DialogDescription>
                    Create a new algorithm to visualize and save for later use.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newAlgorithm.title}
                      onChange={(e) => setNewAlgorithm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter algorithm title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={newAlgorithm.language} onValueChange={(value) => setNewAlgorithm(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Textarea
                      id="code"
                      value={newAlgorithm.code}
                      onChange={(e) => setNewAlgorithm(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Enter your algorithm code"
                      rows={10}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateAlgorithm} className="flex-1">
                      Create Algorithm
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <Tabs defaultValue="algorithms" className="space-y-6">
          <TabsList>
            <TabsTrigger value="algorithms">My Algorithms</TabsTrigger>
          </TabsList>

          <TabsContent value="algorithms" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search algorithms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Recursion">Recursion</SelectItem>
                  <SelectItem value="Backtracking">Backtracking</SelectItem>
                  <SelectItem value="Memoization">Memoization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Algorithms Grid (from DB) */}
            {isLoadingDb ? (
              <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>
            ) : filteredDbAlgorithms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No algorithms yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first algorithm to get started
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Algorithm
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDbAlgorithms.map((algorithm) => (
                  <Card key={algorithm._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{algorithm.title}</CardTitle>
                          <CardDescription className="text-sm">
                            Created {new Date(algorithm.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDbBookmark(algorithm._id)}
                            title={algorithm.__bookmarked ? 'Remove bookmark' : 'Bookmark'}
                          >
                            {algorithm.__bookmarked ? <BookmarkCheck className="h-4 w-4 text-blue-600" /> : <Bookmark className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlgorithm(algorithm._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline">{algorithm.language}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Code hidden in list view; fetched on demand when opening */}
                        
                        <div className="flex gap-2">
                          <Button className="flex-1 gap-2" onClick={() => handleOpenDbAlgorithm(algorithm._id)}>
                            <Play className="h-4 w-4" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          
        </Tabs>
      </main>
    </>
  );
};

export default Dashboard;