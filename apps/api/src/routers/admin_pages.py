import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.deps import DbSession, CurrentAdmin
from src.models.page import Page, PageRevision, Media
from src.schemas.page import (
    PageCreateRequest,
    PageUpdateRequest,
    PageResponse,
    PageListResponse,
    MediaResponse,
    PageRevisionResponse,
)
from src.schemas.common import PaginatedResponse, MessageResponse
from src.utils.storage import delete_file

router = APIRouter(prefix="/api/admin/pages", tags=["admin"])

SEED_PAGES = [
    {
        "slug": "home",
        "title": "Home",
        "status": "published",
        "sections": [
            {"id": "hs-1", "type": "hero_slideshow", "data": {"slides": ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"], "heading_primary": "Spaces of Learning", "heading_secondary": "Nurture your dream into a successful business", "description": "SOL's helpful mentors, conscious investors and private business portal brings success for a better Earth.", "buttons": [{"label": "Explore SOL", "link": "/become-a-member", "style": "solid"}, {"label": "Learn More", "link": "/resonance", "style": "outline"}]}},
            {"id": "tg-1", "type": "tagline", "data": {"heading_primary": "Become a Spiritual Entrepreneur for Freedom", "heading_secondary": "Work For yourSelf * Have more income"}},
            {"id": "pc-1", "type": "pillar_cards", "data": {"cards": [{"title": "Innovators", "description": "We help innovators refine, fund, and ground their projects.", "link_text": "Build your idea", "link_url": "/innovators", "icon": "rocket", "is_accent": False}, {"title": "Mentors", "description": "We connect mentors, land stewards, and conscious investors to support projects.", "link_text": "Help Others", "link_url": "/mentors", "icon": "graduation_cap", "is_accent": True}, {"title": "Conscious Investors", "description": "Conscious Investors provide capital, resources, and bring ideas to life.", "link_text": "Support Ideas", "link_url": "/investors", "icon": "handshake", "is_accent": False}]}},
            {"id": "rg-mirror-home", "type": "centered_statement", "data": {"heading": "The Mirror Has No Identity", "body": "You don't have to know where you fit yet. Within SOL, you are met before any title is named. The mirror does not decide who you are \u2014 it reflects what is already true. From that clarity, your contribution comes into focus.", "buttons": [{"label": "Explore Resonance Gateway", "link": "/resonance", "style": "solid"}]}},
            {"id": "pc-participant", "type": "participant_card", "data": {}},
            {"id": "oc-1", "type": "overlay_card", "data": {"background_image": "/investor-bg.jpg", "overlay_color": "accent", "heading": "SOL HUB", "description": "Join our private portal and be paired with the right people.", "checklist": ["See Projects", "Be paired with projects", "Connect with users"], "link_text": "Join Now", "link_url": "/become-a-member"}},
            {"id": "ms-1", "type": "mission", "data": {"badge_text": "OUR MISSION", "badge_link": "/blog", "headings": ["A hub for Innovation to Solution", "Any age, any person can start a business becoming the architect of your life"], "paragraphs": ["At SOL, our mission is to offer a nurturing, private space where ideas come to life, at any age. From inspiration to implementation, we support our members by providing practical knowledge and real-world skills to help bring their visions to market. By connecting innovators with mentors and essential resources, we empower individuals to transform their passions into impactful, sustainable ventures that enrich their communities and the world.", "The New Earth needs fresh ideas, and SOL is here to deliver them in a whole new way: the SOL way. Join us and help make a difference!"], "image": "/about-bg.jpg", "button_text": "Become a Member", "button_link": "/become-a-member"}},
            {"id": "qt-1", "type": "quote", "data": {"background_image": "/about-bg.jpg", "quote_text": "If you can dream it, you can achieve it. - Zig Ziglar", "secondary_text": "Think Globally, Act Locally & Connect Everywhere"}},
            {"id": "ps-1", "type": "process_steps", "data": {"badge_text": "How it works?", "badge_link": "/blog", "heading": "Collaboration Over Competition", "subtext": "The future thrives on collaboration and cooperation, not competition. SOL fosters a global mindset with local action, creating solutions", "steps": [{"title": "Submit an Idea", "description": "Innovators pitch through our guided proposal portal.", "icon": "file_text"}, {"title": "Get Matched", "description": "Mentors and investors join based on interest and expertise.", "icon": "users"}, {"title": "Co-Create", "description": "Projects receive funding, mentorship, and community support.", "icon": "pen"}], "button_text": "Get Started Now!", "button_link": "/become-a-member"}},
            {"id": "rg-steward-home", "type": "steward_intro", "data": {"name": "Whitney", "title": "SOL's Resonance Steward", "statement": "I serve as the first living gateway into Spaces of Learning. I hold a space of reflection where what is already true can become visible \u2014 allowing authentic alignment to follow naturally. From that clarity, each person's unique contribution, relationships, and next steps within SOL come into focus.", "principle": "I'm not deciding whether you belong. I'm not assigning you a role. I'm holding a space of reflection in which you become more visible to yourself \u2014 and to SOL. The mirror has no identity; that's why it's so clear.", "buttons": [{"label": "Begin Your Journey", "link": "/become-a-member", "style": "solid"}, {"label": "Learn More", "link": "/resonance", "style": "outline"}]}},
            {"id": "cb-1", "type": "cta_banner", "data": {"background_image": "/community-bg.jpg", "heading_primary": "SPACES OF LEARNING", "heading_secondary": "Join SOL Today", "description": "Be a part of the movement to create the New Earth. Whether you're an entrepreneur, investor, mentor, or dreamer, SOL is your platform to make a difference. Let's build a better world together.", "buttons": [{"label": "Become a Member", "link": "/become-a-member", "style": "solid"}, {"label": "Explore Resonance", "link": "/resonance", "style": "outline"}]}},
        ],
    },
    {
        "slug": "innovators",
        "title": "For Innovators",
        "status": "published",
        "sections": [
            {"id": "hero-innovators", "type": "hero", "data": {"eyebrow": "Innovators", "heading": "Turn Your Idea into Reality with SOL", "subtext": "We empower innovators to refine, fund, and ground their projects with the help of mentors, investors, and a supportive community.", "background_image": "/innovators-hero-bg.jpg"}},
            {"id": "in-content", "type": "columns", "data": {"heading": "Your Journey", "columns": 2, "left": "<span class=\"text-sm font-bold uppercase tracking-widest text-accent\">YOUR JOURNEY</span><h2>Tools, resources, and connections</h2><h3 class=\"text-accent\">to help you launch transformative ideas</h3><p>Whether you've spotted a problem, envisioned a solution, or already mapped out a plan, we're here to guide you every step of the way.</p>", "right": "<img src=\"/innovators-hero.jpg\" alt=\"Innovators\" style=\"border-radius:0 40px 0 40px;width:100%;height:auto\" />"}},
            {"id": "in-tagline", "type": "tagline", "data": {"heading_primary": "Innovators Start Your Engine", "heading_secondary": "The Dreamer, Builder, Visionary.", "icon": ""}},
            {"id": "in-features", "type": "feature_cards", "data": {"cards": [{"icon": "clipboard", "title": "Plan Ahead", "description": "Turn your vision into a structured, actionable plan with guided proposal frameworks and access to resources."}, {"icon": "users", "title": "Start-Up Mentor", "description": "Every innovator is paired with a mentor who aligns with their vision, providing personalized advice and practical knowledge."}, {"icon": "dollar", "title": "Financial Support", "description": "Connect with heart-centered investors who believe in your mission and gain access to aligned capital."}, {"icon": "shield", "title": "Future Proof", "description": "Learn how to future-proof your project through regenerative practices and innovative strategies."}]}},
            {"id": "in-ready", "type": "cta", "data": {"heading": "Are you ready?", "subheading": "Kickstart your vision!"}},
            {"id": "in-steps", "type": "process_steps", "data": {"heading": "Collaboration Over Competition", "subtext": "The future thrives on collaboration and cooperation, not competition.", "steps": [{"title": "Present Your Purpose", "description": "Share your vision with us by submitting your idea through our guided proposal portal.", "icon": "file_text"}, {"title": "Join the Community", "description": "Become a member of our global network of innovators, mentors, and investors.", "icon": "users"}, {"title": "Co-Create and Grow", "description": "Collaborate with like-minded individuals, receive funding, and bring your idea to life.", "icon": "pen"}]}},
            {"id": "in-cta", "type": "cta_banner", "data": {"background_image": "/innovators-cta-bg.jpg", "heading_primary": "Ready to Make an Impact?", "heading_secondary": "Innovators Unite", "description": "The world needs your ideas, and we are here to help you bring them to life. Take the first step today.", "buttons": [{"label": "Get Started", "link": "/register", "style": "solid"}]}},
        ],
    },
    {
        "slug": "mentors",
        "title": "For Mentors",
        "status": "published",
        "sections": [
            {"id": "hero-mentors", "type": "hero", "data": {"eyebrow": "Mentors", "heading": "Empower Innovators, Shape the Future", "subtext": "Join SOL as a mentor and guide visionaries through challenges, growth, and meaningful impact.", "background_image": "/mentors-hero-bg.jpg"}},
            {"id": "mn-content", "type": "columns", "data": {"heading": "How You Can Make a Difference", "columns": 2, "left": "<span class=\"text-sm font-bold uppercase tracking-widest text-accent\">GET INVOLVED</span><h2>How You Can Make a Difference</h2><p>At SOL, mentors are the backbone of innovation. Your experience, wisdom, and unique perspective can shape the next generation of ideas.</p>", "right": "<img src=\"/mentors-hero.jpg\" alt=\"Mentors\" style=\"border-radius:0 40px 0 40px;width:100%;height:auto\" />"}},
            {"id": "mn-tagline", "type": "tagline", "data": {"heading_primary": "Benefits to our Network", "heading_secondary": "Give back & Find a Purpose", "icon": ""}},
            {"id": "mn-benefits", "type": "benefit_cards", "data": {"cards": [{"title": "Share Your Experiences", "description": "Bring your unique perspective to the table. Share lived experiences and insights that inspire and guide innovators on their journey.", "is_accent": False}, {"title": "Commit to Long-Term Impact", "description": "Join us in creating meaningful, sustainable change. Focus on impact and regeneration, not just short-term gains.", "is_accent": True}, {"title": "Be a Catalyst for Growth", "description": "Your guidance can be the turning point for a young innovator. Help shape the next generation of entrepreneurs.", "is_accent": False}]}},
            {"id": "mn-cta", "type": "cta_banner", "data": {"background_image": "/mentors-cta-bg.jpg", "heading_primary": "Ready to Make a Difference?", "heading_secondary": "Team UP with SOL", "description": "We are excited to hear from you. Share your story and let us work together to shape the future of innovation.", "buttons": [{"label": "Join Today", "link": "/register", "style": "solid"}]}},
        ],
    },
    {
        "slug": "investors",
        "title": "For Investors",
        "status": "published",
        "sections": [
            {"id": "hero-investors", "type": "hero", "data": {"eyebrow": "Conscious Investor", "heading": "Align Your Capital with Purpose", "subtext": "Turn dreams into reality by providing the support, resources, and guidance needed to bring visionary ideas to life.", "background_image": "/investors-hero-bg.jpg"}},
            {"id": "iv-content", "type": "columns", "data": {"heading": "Empowering Change", "columns": 2, "left": "<span class=\"text-sm font-bold uppercase tracking-widest text-accent\">GIVE WITH LOVE</span><h2>Empowering Change</h2><h3 class=\"text-accent\">Connecting conscious investors with visionary innovators.</h3><p>At SOL, we connect conscious investors like you with transformative ideas and visionary innovators.</p>", "right": "<img src=\"/investors-hero.jpg\" alt=\"Conscious Investors\" style=\"border-radius:0 40px 0 40px;width:100%;height:auto\" />"}},
            {"id": "iv-tagline", "type": "tagline", "data": {"heading_primary": "Why Invest with SOL?", "heading_secondary": "Align your capital with purpose-driven innovation.", "icon": ""}},
            {"id": "iv-benefits", "type": "benefit_cards", "data": {"cards": [{"title": "Find a Project", "description": "Discover purpose-driven projects that align with your values.", "is_accent": False}, {"title": "Support with Love", "description": "Invest in more than just financial returns. We prioritize heart-centered investments.", "is_accent": True}, {"title": "Protected Ecosystem", "description": "Join a trusted network designed to foster transparency and long-term success.", "is_accent": False}]}},
            {"id": "iv-steps", "type": "process_steps", "data": {"heading": "How It Works", "subtext": "A simple process to start making an impact.", "steps": [{"title": "Make a Match", "description": "Once matched with an innovator, engage through our secure private portal.", "icon": "users"}, {"title": "Join the Community", "description": "Collaborate with heart-centered innovators and mentors.", "icon": "shield"}, {"title": "Watch it grow", "description": "Track project milestones, review progress updates, and access reports.", "icon": "bar_chart"}]}},
            {"id": "iv-cta", "type": "cta_banner", "data": {"background_image": "/investors-cta-bg.jpg", "heading_primary": "Ready to Join the SOL Ecosystem?", "heading_secondary": "Make a dream reality!", "description": "We would love to learn more about you. Connect with us and start making an impact today.", "buttons": [{"label": "Get Started", "link": "/register", "style": "solid"}]}},
        ],
    },
    {
        "slug": "about",
        "title": "About",
        "status": "published",
        "sections": [
            {"id": "ab-hero", "type": "tagline", "data": {"heading_primary": "About Us", "heading_secondary": "We Love Learning", "icon": "/about-icon.svg"}},
            {"id": "ab-about", "type": "text", "data": {"heading": "About Spaces of Learning", "body": "<p>Spaces of Learning exists to bridge vision and action. We support people who feel called to create something meaningful\u2014whether they already have a clear idea or are just beginning to sense their own potential.</p><p>Not everyone arrives with a business plan. Many arrive with a skill, a life experience, or a feeling that they want to build something of their own. At Spaces of Learning, we help uncover those abilities, clarify them, and shape them into viable projects and businesses that can support a person\u2019s life while contributing something of value to the world.</p><p>We work with innovators, mentors, and conscious investors to cultivate enterprises rooted in purpose, sustainability, and real-world impact. Our approach blends practical business development with human-centered guidance\u2014helping people grow ideas that align with their values and their communities.</p>"}},
            {"id": "ab-what", "type": "text", "data": {"heading": "What we do", "body": "<p>Spaces of Learning provides:</p><ul><li>Guided discovery to help individuals identify their skills, passions, and practical strengths</li><li>Mentorship from experienced guides who support both personal and project development</li><li>Community for collaboration, accountability, and shared learning</li><li>Conscious capital connections for projects aligned with regenerative and social good values</li></ul><p>We help translate raw potential into clear direction and tangible plans.</p>"}},
            {"id": "ab-serve", "type": "text", "data": {"heading": "Who we serve", "body": "<p>We work with:</p><ul><li>People who want to create their own livelihood</li><li>Innovators with ideas for positive change</li><li>Those who feel something is missing in current systems and want to help build better ones</li><li>Mentors and investors who believe in supporting purpose-driven work</li></ul><p>You do not need to arrive with everything figured out. You only need curiosity, commitment, and a willingness to explore what you can create.</p>"}},
            {"id": "ab-values", "type": "text", "data": {"heading": "Our Values", "body": "<p>We are guided by:</p><ul><li>Collaboration over competition</li><li>Regeneration over extraction</li><li>Integrity over shortcuts</li><li>Learning through doing</li><li>People and planet alongside profit</li></ul>"}},
            {"id": "ab-vision", "type": "text", "data": {"heading": "Our Vision", "body": "<p>We envision a world where people are able to support themselves through work that is aligned with who they are\u2014where communities are strengthened by locally rooted enterprises and where innovation serves life, not just markets.</p>"}},
            {"id": "ab-mission", "type": "text", "data": {"heading": "Our Mission", "body": "<p>Our mission is to support innovators who see a problem and want to solve it\u2014or who have a solution and need help bringing it to life\u2014by connecting them with mentorship, community, and conscious capital through our hub of resources.</p>"}},
            {"id": "ab-invite", "type": "text", "data": {"heading": "An Invitation", "body": "<p>If you feel called to create, to learn, or to contribute to something larger than yourself, Spaces of Learning is a place to begin. Whether you arrive with an idea or are searching for one, we are here to help you discover your path and build something real from it.</p>"}},
            {"id": "ab-images", "type": "gallery", "data": {"images": ["/about-team.jpg", "/about-laurel-tom.jpg"]}},
            {"id": "ab-team", "type": "text", "data": {"heading": "Who we are", "body": "<h2 style=\"color:#EFC89A;\">Meet Laurel &amp; Tom</h2><p>We have a dream\u2026to provide a SPACE where people, with their fresh new ideas, have access to experts, mentors, equipment, courses, funding, to collaborate in problem solving for solutions for a better world - sparking their own product or service as a business, becoming a spiritual entrepreneur.</p><p>Together, we aim to leave a lasting, positive impact on the planet for future generations.</p><p>We are excited to bring the community together with our team of experts, while learning valuable trades and personal skills that empower new solutions for global health - locally.</p><p>I recognize a gap in our development as a species in our post industrialized world\u2014a missing 'rite of passage' to help YOUTH discover their passions and find purpose in this very changed world. In collaboration with industry and 'thought' experts and funders, I aim to foster introspection, self-reliance, compassion, and an entrepreneurial spirit.</p>"}},
            {"id": "ab-laurel", "type": "text", "data": {"heading": "Laurel", "body": "<p style=\"color:#6b7280;\">Ceo/Founder</p>"}},
            {"id": "ab-began", "type": "text", "data": {"heading": "How it all began", "body": "<h2 style=\"color:#EFC89A;\">Spaces of Love</h2><p>It all begins somewhere!</p>"}},
            {"id": "ab-cta", "type": "cta_banner", "data": {"background_image": "/about-team.jpg", "heading_primary": "Join Us on This Journey", "heading_secondary": "", "description": "Be part of something meaningful. Together, we can build a future where every visionary idea finds the support it needs to thrive.", "buttons": [{"label": "Join Us", "link": "/become-a-member", "style": "solid"}]}},
        ],
    },
    {
        "slug": "blog",
        "title": "Blog",
        "status": "published",
        "sections": [
            {"id": "bl-hero", "type": "tagline", "data": {"heading_primary": "Our Blog", "heading_secondary": "Stories & Ideas", "icon": "/about-icon.svg"}},
            {"id": "bl-posts", "type": "text", "data": {"heading": "", "body": "<p>Blog posts appear here. Posts are managed separately via the posts API.</p>"}},
        ],
    },
    {
        "slug": "what-we-do",
        "title": "What We Do",
        "status": "published",
        "sections": [
            {"id": "hs-wwd", "type": "hero_slideshow", "data": {"slides": ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"], "heading_primary": "What we do", "heading_secondary": "Guide and nurture first time entrepreneurs", "description": "SOL Empowers innovators to turn their visions into reality"}},
            {"id": "tg-wwd", "type": "tagline", "data": {"heading_primary": "One Step for everyone", "heading_secondary": "Create solutions with us"}},
            {"id": "tr-wwd", "type": "tools_resources", "data": {"heading": "Tools, resources, and connections to help you launch transformative ideas", "paragraphs": ["At Spaces of Learning (SOL), we are building the foundation for a New Earth through AdVenture Capitalism\u2014a heart-centered approach to entrepreneurship that blends youthful innovation with elder wisdom and conscious capital. SOL is a hub for spiritual entrepreneurs, mentors, and investors dedicated to building meaningful, values-driven livelihoods that make a real impact.", "There are big gaps with unmet needs that mean opportunity for business creation in"], "tags": ["wellness", "education", "housing", "elder care", "climate adaptation", "mental health"], "image": "/wwd-tools.jpg"}},
            {"id": "pc-wwd", "type": "pillar_cards", "data": {"cards": [{"title": "Innovators", "description": "We help innovators refine, fund, and ground their projects.", "link_text": "Build your idea", "link_url": "/innovators", "icon": "rocket", "is_accent": False}, {"title": "Mentors", "description": "We connect mentors, land stewards, and conscious investors to support projects.", "link_text": "Help Others", "link_url": "/mentors", "icon": "graduation_cap", "is_accent": True}, {"title": "Conscious Investors", "description": "Conscious Investors provide capital, resources, and bring ideas to life.", "link_text": "Support Ideas", "link_url": "/investors", "icon": "handshake", "is_accent": False}]}},
            {"id": "fc-wwd", "type": "feature_cards", "data": {"cards": [{"icon": "clipboard", "title": "Plan Ahead", "description": "At SOL, we help you turn your vision into a structured, actionable plan. With guided proposal frameworks and access to resources, you\u2019ll have the tools to map out your idea and prepare for success. Planning ahead ensures your project is built on a solid foundation."}, {"icon": "users", "title": "Start-Up Mentor", "description": "Every innovator at SOL is paired with a mentor who aligns with their vision. These experienced guides provide personalized advice, share practical knowledge, and help you navigate challenges. With a mentor by your side, you\u2019ll have the support needed to bring your idea to life."}, {"icon": "dollar", "title": "Financial Support", "description": "SOL connects you with heart-centered investors who believe in your mission. Gain access to aligned capital, and opportunities to co-create enterprises. Financial support from SOL ensures you have the resources to execute your vision."}, {"icon": "shield", "title": "Future Proof", "description": "We focus on sustainability and long-term impact. By joining SOL, you\u2019ll learn how to future-proof your project through regenerative practices and innovative strategies. Build something that not only thrives today but also creates a legacy for tomorrow."}]}},
            {"id": "mn-wwd", "type": "mentors", "data": {"background_image": "/wwd-mentors-bg.jpg", "badge": "Business & SOL Guidance", "title": "Mentors with a purpose", "subtext": "The Guide, Teacher, or Muse that will propel your idea!", "description": "Mentors share wisdom, frameworks, and practical experience with innovators and builders.", "description_2": "They act as stabilizing anchors in the ecosystem, bridging knowledge and embodiment.", "checklist": ["Access to aligned mentees and co-creators", "Invitation to workshops and think tanks", "The chance to co-author regenerative case studies"], "footnote": "Submit your video today and tell us about what skills you have to share.", "button_text": "Learn More", "button_link": "/mentors", "image": "/wwd-mentors-team.jpg"}},
            {"id": "iv-wwd", "type": "investors", "data": {"badge": "Invest in ideas", "title": "The Conscious Investor", "paragraphs": ["Turn dreams into reality by providing the support, resources, and guidance needed to bring visionary ideas to life. They champion projects that prioritize sustainability, collaboration, and global impact, helping innovators achieve their purpose."], "footnote": "Share your story with us and we will build trust with the right process.", "button_text": "Learn More", "button_link": "/investors"}},
            {"id": "bc-wwd", "type": "benefit_cards", "data": {"cards": [{"title": "Find a Project", "description": "Discover purpose-driven projects that align with your values. As an Conscious Investor, you gain curated access to vetted ideas focused on sustainability, collaboration, and global impact. From clean energy innovations to community-building initiatives, SOL connects you with opportunities to make a meaningful difference.", "is_accent": False}, {"title": "Support with Love", "description": "Invest in more than just financial returns\u2014invest in regenerative change. At SOL, we prioritize heart-centered investments that amplify love, purpose, and innovation. By supporting projects with compassion and intention, you help create a ripple effect of positive impact that transforms lives and communities.", "is_accent": True}, {"title": "Protected Ecosystem", "description": "Join a trusted network designed to foster transparency, collaboration, and long-term success. SOL\u2019s secure ecosystem ensures your investments are protected and aligned with projects that prioritize sustainability and ethical practices. Together, we build enterprises that thrive today and leave a legacy for tomorrow.", "is_accent": False}]}},
            {"id": "cb1-wwd", "type": "cta_banner", "data": {"background_image": "/wwd-cta-bg.jpg", "heading_primary": "Are you ready?", "heading_secondary": "Let\u2019s empower Visionaries to Regenerate Earth", "description": "", "buttons": []}},
            {"id": "ps-wwd", "type": "process_steps", "data": {"variant": "numbers", "badge_text": "", "badge_link": "", "heading": "", "subtext": "", "steps": [{"title": "Present Your Purpose", "description": "Share your vision with us by submitting your idea through our guided proposal portal. Clearly outline your purpose and how it aligns with SOL\u2019s mission to create sustainable and regenerative solutions.", "icon": "file_text"}, {"title": "Join the Community", "description": "Become a member of our global network of innovators, mentors, and investors. Gain access to exclusive resources, mentorship opportunities, and a supportive ecosystem designed to help you thrive.", "icon": "file_text"}, {"title": "Co-Create and Grow", "description": "Collaborate with like-minded individuals, receive funding, and bring your idea to life. Together, we\u2019ll build impactful projects that regenerate Earth and create lasting change.", "icon": "file_text"}], "button_text": "", "button_link": ""}},
            {"id": "cb2-wwd", "type": "cta_banner", "data": {"background_image": "/wwd-cta-bg.jpg", "heading_primary": "Tell us your idea & we are here to make it come true!", "heading_secondary": "Bringing a higher future to the present", "description": "Let\u2019s get together and build new opportunities.", "buttons": [{"label": "SIGN-UP", "link": "/register", "style": "solid"}]}},
        ],
    },
    {
        "slug": "resonance",
        "title": "The Resonance Gateway",
        "status": "published",
        "sections": [
            {"id": "rg-hero", "type": "hero", "data": {"eyebrow": "The Resonance Gateway", "heading": "The Resonance Gateway", "subtext": "The living point of entry into Spaces of Learning. A space of reflection where, beyond titles, resumes, and ambition, what is already true about you can become visible."}},
            {"id": "rg-steward", "type": "steward_intro", "data": {"name": "Whitney", "title": "SOL's Resonance Steward", "statement": "I serve as the first living gateway into Spaces of Learning. I hold a space of reflection where what is already true can become visible \u2014 allowing authentic alignment to follow naturally. From that clarity, each person's unique contribution, relationships, and next steps within SOL come into focus.", "principle": "I'm not deciding whether you belong. I'm not assigning you a role. I'm holding a space of reflection in which you become more visible to yourself \u2014 and to SOL. The mirror has no identity; that's why it's so clear."}},
            {"id": "rg-principles", "type": "principle_cards", "data": {"heading": "What the Gateway Is", "subtext": "Three principles guide how we meet every new member.", "cards": [{"icon": "sparkles", "title": "Resonance, not alignment", "description": "Alignment is the result. Resonance is the mechanism. We meet you; we do not align you. Resonance reveals, and alignment naturally follows."}, {"icon": "compass", "title": "Reveal, don't recognize", "description": "We create the conditions in which what is already true can become visible. Not giving. Not teaching. Not convincing. Revealing."}, {"icon": "heart_handshake", "title": "Contribution, not role", "description": "Your contribution comes into focus. A role can change; contribution is deeper. From it, roles, collaborations, and opportunities emerge."}]}},
            {"id": "rg-mirror", "type": "centered_statement", "data": {"heading": "The Mirror Has No Identity", "body": "This is more than a quote. It is the design principle that explains why the Gateway works. The mirror does not decide who you are. It has no identity of its own \u2014 and that is exactly why it can reflect you so clearly. You are not evaluated here. You are met."}},
            {"id": "rg-cta", "type": "cta_banner", "data": {"background_image": "/community-bg.jpg", "heading_primary": "Ready to Be Met?", "heading_secondary": "Enter the Gateway", "description": "Before anything is asked of you \u2014 before any role is named \u2014 you are invited to be met.", "buttons": [{"label": "Enter the Gateway", "link": "/register", "style": "solid"}]}},
        ],
    },
    {
        "slug": "become-a-member",
        "title": "Become a Member",
        "status": "published",
        "sections": [
            {"id": "bm-hero", "type": "hero_actions", "data": {"heading": "Enter the", "highlight": "Resonance Gateway", "icon": "/sol-icon.svg", "subtext": "SPACES OF LEARNING is a private community where innovators, mentors, and conscious investors are first met \u2014 beyond titles, resumes, and ambition. Through resonance, the most aligned path for your contribution is revealed, not assigned.", "buttons": [{"label": "Begin the Conversation", "link": "/register", "style": "solid"}, {"label": "View Membership Agreement", "link": "/membership-agreement", "style": "outline"}]}},
            {"id": "bm-notice", "type": "notice_banner", "data": {"text": "SPACES OF LEARNING is a Private Membership Association exercising the right of freedom of association as guaranteed by the 1st and 14th Amendments of the U.S. Constitution. All members are bound by the", "link_text": "Membership Agreement", "link_url": "/membership-agreement"}},
            {"id": "bm-benefits", "type": "feature_cards", "data": {"cards": [{"icon": "graduation_cap", "title": "Mentorship Training", "description": "Access expert-led training sessions designed to help you grow as an innovator, mentor, or conscious investor."}, {"icon": "users", "title": "Private Social Hub", "description": "Connect with like-minded members in our private community platform \u2014 share ideas, resources, and opportunities."}, {"icon": "globe", "title": "Business & Lawful", "description": "Learn how to structure and grow your business within a lawful framework that protects your rights and privacy."}, {"icon": "shield", "title": "Community", "description": "Join a supportive private membership association where your freedom of association is protected under the 1st and 14th Amendments."}]}},
            {"id": "bm-join", "type": "process_steps", "data": {"variant": "numbers", "heading": "How to Join", "subtext": "Getting started is simple. Follow these three steps.", "steps": [{"title": "Arrive", "description": "Cross the threshold into SOL as a private member. No application, nothing to qualify."}, {"title": "Be Met", "description": "Through the Resonance Gateway, Whitney holds a space of reflection where what you already carry can become visible."}, {"title": "Let it Come Into Focus", "description": "From that clarity, your contribution, your relationships, and your next steps within SOL reveal themselves."}], "button_text": "", "button_link": ""}},
            {"id": "bm-alerts", "type": "cta_banner", "data": {"heading_primary": "Get Email Alerts", "heading_secondary": "", "description": "Stay informed about events, opportunities, and community updates.", "buttons": [{"label": "Begin the Conversation", "link": "/register", "style": "solid"}]}},
            {"id": "bm-faq", "type": "faq_list", "data": {"heading": "Frequently Asked Questions", "faqs": [{"q": "What is a Private Membership Association (PMA)?", "a": "A PMA is a private unincorporated association operating under the protections of the 1st and 14th Amendments. Members gather for lawful purposes including education, mentorship, and mutual support, outside the jurisdiction of state and federal regulatory agencies."}, {"q": "Is there a membership fee?", "a": "Membership is currently free. We believe in providing access to education and community without financial barriers."}, {"q": "Who can join?", "a": "Anyone ready to be met beyond their title. Within SOL, contribution takes many forms \u2014 as an innovator, a mentor, a collaborator, or a conscious investor. Which is yours comes into focus through reflection, not a checkbox."}, {"q": "What does membership include?", "a": "Members gain access to our private social hub, mentorship training programs, community forums, events, resources, and the ability to connect with fellow members."}, {"q": "How do I cancel my membership?", "a": "You can withdraw from this agreement and terminate your membership at any time. Contact us and we will process your request promptly."}]}},
            {"id": "bm-cta", "type": "cta_banner", "data": {"heading_primary": "Ready to Be Met?", "heading_secondary": "", "description": "Step into SOL and let your contribution come into focus.", "buttons": [{"label": "Enter the Gateway", "link": "/register", "style": "solid"}]}},
        ],
    },
]


@router.post("/seed", response_model=list[PageResponse], status_code=status.HTTP_201_CREATED)
async def seed_pages(db: DbSession, current_admin: CurrentAdmin):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can seed pages")
    created = []
    for page_data in SEED_PAGES:
        existing = await db.execute(select(Page).where(Page.slug == page_data["slug"], Page.is_deleted == False))
        if existing.scalar_one_or_none():
            continue
        page = Page(
            slug=page_data["slug"],
            title=page_data["title"],
            status=page_data["status"],
            sections=page_data.get("sections", []),
            author_id=current_admin.id,
        )
        db.add(page)
        created.append(page)
    await db.flush()
    return created


# ── Page CRUD ──


@router.get("", response_model=PaginatedResponse[PageListResponse])
async def list_pages(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str | None = None,
):
    query = select(Page).where(Page.is_deleted == False)
    count_query = select(func.count(Page.id)).where(Page.is_deleted == False)
    if status:
        query = query.where(Page.status == status)
        count_query = count_query.where(Page.status == status)
    total = await db.scalar(count_query)
    result = await db.execute(query.order_by(Page.updated_at.desc().nulls_last()).offset(skip).limit(limit))
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(body: PageCreateRequest, db: DbSession, current_admin: CurrentAdmin):
    existing = await db.execute(select(Page).where(Page.slug == body.slug, Page.is_deleted == False))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A page with this slug already exists")
    page = Page(
        slug=body.slug,
        title=body.title,
        status=body.status,
        layout=body.layout,
        sections=[s.model_dump() for s in body.sections],
        seo=body.seo,
        author_id=current_admin.id,
    )
    db.add(page)
    await db.flush()
    return page


@router.get("/{page_id}", response_model=PageResponse)
async def get_page(page_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


@router.put("/{page_id}", response_model=PageResponse)
async def update_page(page_id: uuid.UUID, body: PageUpdateRequest, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    update_data = body.model_dump(exclude_unset=True)
    if "sections" in update_data and update_data["sections"] is not None:
        update_data["sections"] = [s.model_dump() if hasattr(s, "model_dump") else s for s in update_data["sections"]]
    for field, value in update_data.items():
        setattr(page, field, value)
    await db.flush()
    return page


@router.delete("/{page_id}", response_model=MessageResponse)
async def delete_page(page_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    page.is_deleted = True
    await db.flush()
    return MessageResponse(detail="Page deleted successfully")


# ── Sections Operations ──


@router.post("/{page_id}/sections", response_model=PageResponse)
async def add_section(page_id: uuid.UUID, body: dict, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections = list(page.sections or [])
    section = {
        "id": str(uuid.uuid4()),
        "type": body.get("type", "text"),
        "data": body.get("data", {}),
    }
    sections.append(section)
    page.sections = sections
    await db.flush()
    return page


@router.put("/{page_id}/sections/{section_id}", response_model=PageResponse)
async def update_section(page_id: uuid.UUID, section_id: str, body: dict, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections = list(page.sections or [])
    for s in sections:
        if s.get("id") == section_id:
            if "type" in body:
                s["type"] = body["type"]
            if "data" in body:
                s["data"] = body["data"]
            break
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    page.sections = sections
    await db.flush()
    return page


@router.delete("/{page_id}/sections/{section_id}", response_model=PageResponse)
async def delete_section(page_id: uuid.UUID, section_id: str, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections = [s for s in (page.sections or []) if s.get("id") != section_id]
    if len(sections) == len(page.sections or []):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    page.sections = sections
    await db.flush()
    return page


@router.put("/{page_id}/sections/reorder", response_model=PageResponse)
async def reorder_sections(page_id: uuid.UUID, body: list[str], db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections_by_id = {s.get("id"): s for s in (page.sections or [])}
    reordered = []
    for sid in body:
        if sid in sections_by_id:
            reordered.append(sections_by_id[sid])
    page.sections = reordered
    await db.flush()
    return page


# ── Revisions ──


@router.get("/{page_id}/revisions", response_model=PaginatedResponse[PageRevisionResponse])
async def list_revisions(
    page_id: uuid.UUID,
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    total = await db.scalar(select(func.count(PageRevision.id)).where(PageRevision.page_id == page_id))
    result = await db.execute(
        select(PageRevision)
        .where(PageRevision.page_id == page_id)
        .order_by(PageRevision.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("/{page_id}/revisions", response_model=PageRevisionResponse, status_code=status.HTTP_201_CREATED)
async def create_revision(page_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    revision = PageRevision(
        page_id=page.id,
        sections_snapshot=page.sections,
        author_id=current_admin.id,
    )
    db.add(revision)
    await db.flush()
    return revision


@router.post("/{page_id}/revisions/{revision_id}/restore", response_model=PageResponse)
async def restore_revision(page_id: uuid.UUID, revision_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    rev_result = await db.execute(select(PageRevision).where(PageRevision.id == revision_id, PageRevision.page_id == page_id))
    revision = rev_result.scalar_one_or_none()
    if not revision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")
    page.sections = revision.sections_snapshot
    await db.flush()
    return page
