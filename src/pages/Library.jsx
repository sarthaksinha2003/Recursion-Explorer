import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Search, Bookmark, BookmarkCheck, Play, Filter } from "lucide-react";
import { examples } from "@/lib/examples";

const categories = ["Recursion", "Backtracking", "Memoization"];

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [bookmarkedExamples, setBookmarkedExamples] = useState([]);
  const [isLoggedIn] = useState(false); // This will be managed by auth context later

  useEffect(() => {
    // Load bookmarked examples from localStorage
    const bookmarks = localStorage.getItem('recursion-explorer-bookmarks');
    if (bookmarks) {
      setBookmarkedExamples(JSON.parse(bookmarks));
    }
  }, []);

  const toggleBookmark = (exampleId) => {
    if (!isLoggedIn) return; // Only allow bookmarking for logged-in users
    
    const newBookmarks = bookmarkedExamples.includes(exampleId)
      ? bookmarkedExamples.filter(id => id !== exampleId)
      : [...bookmarkedExamples, exampleId];
    
    setBookmarkedExamples(newBookmarks);
    localStorage.setItem('recursion-explorer-bookmarks', JSON.stringify(newBookmarks));
  };

  // Convert examples object to array for filtering
  const examplesArray = Object.entries(examples).map(([id, example]) => ({
    id,
    ...example
  }));
  
  const filteredExamples = examplesArray.filter(example => {
    const matchesSearch = example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || example.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Seo
        title="Problem Library | Recursion, Backtracking & Memoization"
        description="Explore built-in algorithm examples with descriptions, pseudocode, and ready-to-run visualizations."
        canonical="/library"
      />
      <main className="container mx-auto py-6">
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Problem Library</h1>
          </div>
          <p className="text-muted-foreground mb-6">Choose an example to visualize and learn from step-by-step execution.</p>
          
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
        </header>

        <div className="space-y-8">
          {filteredExamples.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No algorithms found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={() => { setSearchTerm(""); setFilterCategory("all"); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExamples.map((example) => (
                <Card key={example.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{example.title}</CardTitle>
                        <CardDescription className="text-sm mb-3">
                          {example.description}
                        </CardDescription>
                      </div>
                      {isLoggedIn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(example.id)}
                          className="ml-2"
                        >
                          {bookmarkedExamples.includes(example.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                        {example.explanation && (
                          <Button variant="outline" size="sm" className="px-3">
                            Learn More
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Library;