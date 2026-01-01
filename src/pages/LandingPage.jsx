import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Header */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white/90 backdrop-blur-md'} border-b border-gray-200`}>
                <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ETP TeachFlow
                    </div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
                        <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">How It Works</a>
                        <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
                        <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-transparent">
                            One Platform. Smarter Teaching. Better Learning.
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            AI-powered hybrid learning platform that brings live classes, recorded sessions, and intelligent analytics together for institutions, teachers, and students.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            <Link to="/login" className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                Get Started Free
                            </Link>
                            <Link to="/institution/signup" className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold border-2 border-indigo-600 hover:bg-slate-50 transition-all duration-300">
                                Request Demo
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-white rounded-3xl shadow-2xl p-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl overflow-hidden" style={{ height: '400px' }}>
                                <div className="h-10 bg-white/10 backdrop-blur-sm flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                                </div>
                                <div className="p-8 space-y-4">
                                    {[0, 0.2, 0.4].map((delay, i) => (
                                        <div
                                            key={i}
                                            className="bg-white/95 rounded-xl p-6 animate-float"
                                            style={{ animationDelay: `${delay}s` }}
                                        >
                                            <div className={`h-3 ${i === 0 ? 'w-3/5 bg-indigo-600' : i === 1 ? 'w-1/2 bg-cyan-500' : 'w-4/6 bg-purple-600'} rounded-full mb-2`}></div>
                                            <div className="h-2 w-4/5 bg-black/10 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Hybrid Learning, Simplified</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to teach, learn, and manage educational experiences in one powerful platform</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: '📹', title: 'Live & Recorded Classes', desc: 'Stream live sessions or upload recordings. Students learn on their schedule without missing content.' },
                            { icon: '📊', title: 'Role-Based Dashboards', desc: 'Tailored interfaces for admins, teachers, and students. Everyone sees what matters most to them.' },
                            { icon: '🎯', title: 'Smart Batch Management', desc: 'Organize courses, batches, and schedules effortlessly. Handle multiple programs with ease.' },
                            { icon: '🤖', title: 'AI-Powered Assistance', desc: 'Intelligent doubt resolution and engagement tracking. Technology that understands education.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-200">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Audience */}
            <section className="py-24 px-6 bg-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Built For Everyone in Education</h2>
                        <p className="text-xl text-gray-600">Whether you run an institution, teach students, or are learning yourself</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: '🏛️', title: 'Institutions', desc: 'Scale from a small tutoring center to a large educational institution. Manage multiple programs, track performance, and maintain complete control with powerful admin tools.' },
                            { icon: '👨‍🏫', title: 'Teachers', desc: 'Focus on teaching, not technology. Create engaging content, conduct live classes, track student progress, and build meaningful connections with learners.' },
                            { icon: '🎓', title: 'Students', desc: 'Learn at your own pace with access to live classes, recorded sessions, notes, and tests. Stay engaged and track your progress every step of the way.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-gradient-to-br from-slate-50 to-white p-10 rounded-3xl text-center border-2 border-gray-200 hover:border-indigo-600 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                <p className="text-gray-700 text-lg leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Everything You Need, Nothing You Don't</h2>
                        <p className="text-xl text-gray-600">Powerful features designed for real classrooms and modern learning</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: '🎥', title: 'Live Class Streaming', desc: 'High-quality video streaming with screen sharing, whiteboard, and real-time interaction.' },
                            { icon: '📚', title: 'Recorded Lectures', desc: 'Upload and organize video content. Students can rewatch and learn at their convenience.' },
                            { icon: '📅', title: 'Schedule Management', desc: 'Plan classes, set timelines, and manage batches with an intuitive calendar system.' },
                            { icon: '💡', title: 'Smart Doubt Handling', desc: 'AI-powered assistance helps students get answers quickly while teachers focus on complex queries.' },
                            { icon: '📝', title: 'Notes & Resources', desc: 'Share study materials, PDFs, and resources. Keep everything organized in one place.' },
                            { icon: '✅', title: 'Tests & Assessments', desc: 'Create quizzes and assignments. Auto-grade and track student performance effortlessly.' },
                            { icon: '📈', title: 'Analytics Dashboard', desc: 'Real-time insights into engagement, attendance, performance, and learning patterns.' },
                            { icon: '🔐', title: 'Admin Control', desc: 'Complete oversight with user management, permissions, and comprehensive reporting tools.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:border-indigo-600 transition-all duration-300 border border-gray-200">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-6 text-indigo-600">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6 bg-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Get Started in Minutes</h2>
                        <p className="text-xl text-gray-600">Simple setup, powerful results</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { num: '1', title: 'Create Account', desc: 'Sign up and set up your institution or teaching profile in under 2 minutes.' },
                            { num: '2', title: 'Set Up Batches', desc: 'Organize courses, create batches, and invite students to your programs.' },
                            { num: '3', title: 'Start Teaching', desc: 'Go live or upload content. Your students can join and start learning immediately.' },
                            { num: '4', title: 'Track Progress', desc: 'Monitor engagement, performance, and outcomes with real-time analytics.' }
                        ].map((item, i) => (
                            <div key={i} className="text-center relative">
                                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-indigo-200"></div>}
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg relative z-10">
                                    {item.num}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Why Choose ETP TeachFlow</h2>
                        <p className="text-xl text-gray-600">The platform built for how education really works</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { icon: '🎯', title: 'All-in-One Platform', desc: 'Stop juggling multiple tools. Live classes, content management, analytics, and communication in one seamless experience.' },
                            { icon: '✨', title: 'Clean & Intuitive', desc: 'Beautiful interface that\'s easy to navigate. Spend time teaching and learning, not figuring out software.' },
                            { icon: '📈', title: 'Scales With You', desc: 'Perfect for solo tutors and large institutions alike. Grow from 10 to 10,000 students without changing platforms.' },
                            { icon: '🏫', title: 'Built for Real Classrooms', desc: 'Not just another course platform. Designed specifically for institutions managing ongoing educational programs.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 p-8 bg-slate-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Upgrade the Way You Teach and Learn</h2>
                    <p className="text-xl mb-10 opacity-95">Join thousands of educators and students already experiencing smarter education</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link to="/login" className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-slate-100 hover:-translate-y-1 transition-all duration-300">
                            Start Free Trial
                        </Link>
                        <Link to="/institution/signup" className="px-8 py-3.5 bg-transparent text-white rounded-xl font-semibold border-2 border-white hover:bg-white/10 transition-all duration-300">
                            Schedule Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-gray-400 py-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                            ETP TeachFlow
                        </h3>
                        <p className="leading-relaxed">
                            Transforming education through AI-powered hybrid learning. One platform for institutions, teachers, and students to thrive.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <div className="space-y-3">
                            <a href="#features" className="block hover:text-indigo-500 transition-colors">Features</a>
                            <a href="#pricing" className="block hover:text-indigo-500 transition-colors">Pricing</a>
                            <a href="#how-it-works" className="block hover:text-indigo-500 transition-colors">How It Works</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <div className="space-y-3">
                            <a href="#" className="block hover:text-indigo-500 transition-colors">About Us</a>
                            <a href="#" className="block hover:text-indigo-500 transition-colors">Careers</a>
                            <a href="#" className="block hover:text-indigo-500 transition-colors">Contact</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <div className="space-y-3">
                            <a href="#" className="block hover:text-indigo-500 transition-colors">Privacy Policy</a>
                            <a href="#" className="block hover:text-indigo-500 transition-colors">Terms of Service</a>
                            <a href="#" className="block hover:text-indigo-500 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-gray-600">
                    <p>&copy; 2026 ETP TeachFlow. All rights reserved.</p>
                </div>
            </footer>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
