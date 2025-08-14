import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Share2, 
  Bookmark,
  Search,
  Filter,
  Home
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import { getSavedAlgorithms, saveAlgorithm, deleteAlgorithm } from "@/lib/storage";
import { examples } from "@/lib/examples";

const Dashboard = () => {
  const [savedAlgorithms, setSavedAlgorithms] = useState([]);
  const [bookmarkedExamples, setBookmarkedExamples] = useState([]);
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
    // Load bookmarked examples from localStorage
    const bookmarks = localStorage.getItem('recursion-explorer-bookmarks');
    if (bookmarks) {
      setBookmarkedExamples(JSON.parse(bookmarks));
    }
  }, []);

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

  const handleDeleteAlgorithm = (id) => {
    if (deleteAlgorithm(id)) {
      setSavedAlgorithms(prev => prev.filter(algo => algo.id !== id));
    }
  };

  const toggleBookmark = (exampleId) => {
    const newBookmarks = bookmarkedExamples.includes(exampleId)
      ? bookmarkedExamples.filter(id => id !== exampleId)
      : [...bookmarkedExamples, exampleId];
    
    setBookmarkedExamples(newBookmarks);
    localStorage.setItem('recursion-explorer-bookmarks', JSON.stringify(newBookmarks));
  };

  const filteredAlgorithms = savedAlgorithms.filter(algo => 
    algo.title && algo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bookmarkedExamplesList = Object.entries(examples)
    .filter(([key]) => bookmarkedExamples.includes(key))
    .map(([key, example]) => ({ ...example, id: key }));

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
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
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

            {/* Algorithms Grid */}
            {filteredAlgorithms.length === 0 ? (
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
                {filteredAlgorithms.map((algorithm) => (
                  <Card key={algorithm.id} className="hover:shadow-lg transition-shadow">
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
                            onClick={() => handleDeleteAlgorithm(algorithm.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline">{algorithm.language}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-32">
                          {algorithm.code}
                        </pre>
                        
                        <div className="flex gap-2">
                          <Link to={`/playground?custom=${algorithm.id}`} className="flex-1">
                            <Button className="w-full gap-2">
                              <Play className="h-4 w-4" />
                              Open
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            {bookmarkedExamplesList.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Bookmark examples from the library to access them here
                  </p>
                  <Link to="/library">
                    <Button>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Browse Library
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookmarkedExamplesList.map((example) => (
                  <Card key={example.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{example.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {example.description}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(example.id)}
                        >
                          <Bookmark className="h-4 w-4 text-blue-600 fill-current" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{example.category}</Badge>
                        <Badge variant="outline">{example.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Pseudocode:</h4>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                            {example.pseudocode}
                          </pre>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link to={`/playground?example=${example.id}`} className="flex-1">
                            <Button className="w-full gap-2">
                              <Play className="h-4 w-4" />
                              Visualize
                            </Button>
                          </Link>
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