import Header from "./components/Header";
import MangoVitals from "./components/widgets/MangoVitals";
import KnowledgeQueue from "./components/widgets/KnowledgeQueue";
import Crypto101 from "./components/widgets/Crypto101";
import RiskPick from "./components/widgets/RiskPick";
import IPOSnapshot from "./components/widgets/IPOSnapshot";
import FamilyCompanion from "./components/widgets/FamilyCompanion";
import LinkedInSnapshot from "./components/widgets/LinkedInSnapshot";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      
      {/* Increased padding */}
      <div className="px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Row 1: Mango Vitals + Knowledge Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <MangoVitals />
            <KnowledgeQueue />
          </div>
          
          {/* Row 2: Crypto 101 + Risk Pick */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Crypto101 />
            <RiskPick />
          </div>
          
          {/* Row 3: IPO Snapshot + Family Companion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <IPOSnapshot />
            <FamilyCompanion />
          </div>
          
          {/* Row 4: LinkedIn Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LinkedInSnapshot />
            {/* 향후 추가 위젯 자리 */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </div>
    </main>
  );
}
