import BookCarousel from "./components/BookCarousel";
import Hero from "../components/Hero";
import { getHomepageData } from "../lib";

export default async function Home() {
  try {
    const data = await getHomepageData();
    const sections = data.data?.sections || [];

    return (
      <div className="page-container">
        <Hero />

        <main className="main-sections">
          {sections.map((section, index) => (
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
