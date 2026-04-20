import Navigation from "@/components/Navigation";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}

      <HeroSlider />

      {/* Founders Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Our Founders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visionary leaders who established Naledi with a commitment to
              educational excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden shadow-card">
                <img
                  src="/images/founder1.jpg"
                  alt="Founder 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Mrs. Majele B.
              </h3>
              <p className="text-muted-foreground leading-relaxed">Founder</p>
            </div>

            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden shadow-card">
                <img
                  src="/images/founder2.jpg"
                  alt="Founder 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Mr Majele M.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Co-Founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Our Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to academic excellence and
              student success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white p-6 rounded-lg shadow-card">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/director.jpg"
                  alt="Director"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">
                MRS MATAA M. N.
              </h3>
              <p className="text-sm text-secondary font-medium">Director</p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-card">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/boardsecretary.jpg"
                  alt="Board Secretary"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">
                MR. PHIRI C. A.
              </h3>
              <p className="text-sm text-secondary font-medium">Head Teacher</p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-card">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/boardmember.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">
                MS. Mabumba P.
              </h3>
              <p className="text-sm text-secondary font-medium">
                Deputy Head Teacher
              </p>
            </div>

            <div className="text-center bg-white p-6 rounded-lg shadow-card">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/accountant.jpg"
                  alt="Accountant"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">
                MS. SIMUNKOMBWE J.
              </h3>
              <p className="text-sm text-secondary font-medium">Accountant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose and Values Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Our Purpose & Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The foundation that guides everything we do at Naledi Secondary
              School
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-card p-8 rounded-lg shadow-card border">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to empower students with a deep understanding of
                God, fostering academic excellence, entrepreneurial skills, and
                strong moral values.
              </p>
            </div>

            <div className="text-center bg-card p-8 rounded-lg shadow-card border">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Values
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Caring attitude, Responsiveness, Respectfulness, and
                Individualized Support.
              </p>
            </div>

            <div className="text-center bg-card p-8 rounded-lg shadow-card border">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We aspire to become the preferred educational institution,
                deeply rooted in biblical principles, both nationally and
                internationally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Board of Directors Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Our Board of Directors
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Distinguished leaders who guide our school's strategic vision and
              governance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center bg-card p-6 rounded-lg shadow-card border">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/chairperson.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                MR. MAJELE B.
              </h3>
              <p className="text-sm text-secondary font-medium">Chairperson</p>
            </div>

            <div className="text-center bg-card p-6 rounded-lg shadow-card border">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/boardsecretary1.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                MRS MAJELE G. C.
              </h3>
              <p className="text-sm text-secondary font-medium">
                Board Secretary
              </p>
            </div>

            <div className="text-center bg-card p-6 rounded-lg shadow-card border">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/board.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                DR. MATAA M. M.
              </h3>
              <p className="text-sm text-secondary font-medium">Board Member</p>
            </div>

            <div className="text-center bg-card p-6 rounded-lg shadow-card border">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/board1.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                MRS. MUNYATI M. M.
              </h3>
              <p className="text-sm text-secondary font-medium">
                Board Secretary
              </p>
            </div>

            <div className="text-center bg-card p-6 rounded-lg shadow-card border">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/board2.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                MR. POTTER T.
              </h3>
              <p className="text-sm text-secondary font-medium">Board Member</p>
            </div>

            <div className="text-center bg-card p-6 rounded-lg shadow-card border">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/board3.jpg"
                  alt="Board Member"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                MRS. POTTER M. M.
              </h3>
              <p className="text-sm text-secondary font-medium">Board Member</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Our History
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A journey of growth, dedication, and educational excellence over
              the years
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-lg overflow-hidden shadow-card">
              <img
                src="/images/oldclass.jpg"
                alt="School History"
                className="w-full h-64 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Old Class Rooms
              </h3>
              <p className="text-muted-foreground leading-relaxed">Year 2000</p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-card">
              <img
                src="images/first-teachers.jpg"
                alt="School History"
                className="w-full h-64 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Our First Teachers
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Miss Chilalika & Mr. Nabuyanda
              </p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-card">
              <img
                src="images/first-primary.jpg"
                alt="School History"
                className="w-full h-64 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary mb-2">
                1st Primary Pupils
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Crawford Mwinga & Chewe Chilalika
              </p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-card">
              <img
                src="images/adventure.jpg"
                alt="School History"
                className="w-full h-64 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Adventure City
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our pupils also get to have fun.
              </p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-card">
              <img
                src="images/community-work.jpg"
                alt="School History"
                className="w-full h-64 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Community Work
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pupils at Bauleni Clinic.
              </p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-card">
              <img
                src="images/grade6-class.jpg"
                alt="School History"
                className="w-full h-64 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary mb-2">
                G6 Class
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In the year 2008
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
