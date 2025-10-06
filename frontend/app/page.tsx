import BookCarousel from "./components/BookCarousel";
import Hero from "./components/Hero";

export default async function Home() {
  try {
    const response = await fetch("http://localhost:5000/api/homepage", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const data = await response.json();
    const sections = data.data?.sections || [];

    return (
      <div className="page-container">
        <Hero />

        <main className="main-sections">
          {sections.map((section: any, index: number) => (
            <BookCarousel
              key={index}
              title={section.title}
              books={section.books}
              seeMoreUrl={section.see_more_url}
            />
          ))}
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching homepage data:", error);

    return (
      <div className="page-container">
        <Hero />

        <main className="main-sections">
          <div className="loading-state">
            <h2 className="error-title">Unable to load books</h2>
            <p className="error-message">
              Please check that the API server is running on localhost:5000
            </p>
          </div>
        </main>
      </div>
    );
  }
}
