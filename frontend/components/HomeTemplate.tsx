

import { useState, useRef, useEffect } from "react"
import { Button } from "@/frontend/components/ui/button"
import { PenTool, GraduationCap, Code, Heart, X, ChevronRight } from "lucide-react"
import {useUser} from "@clerk/nextjs";
import {useMenuStore} from "@/frontend/stores/PromptStore";


export default function Component() {
    const { user } = useUser();

    const username = user?.fullName as string;

    const [activeSection, setActiveSection] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

    const { setSelectedItem} = useMenuStore()


    

    const menuData = {
        Write: [
            "Develop podcast scripts",
            "Create a piece that blends two writing styles",
            "Create blog article series",
            "Draft an outline for my project",
            "Develop content templates"
        ],
        Learn: [
            "Explain complex concepts simply",
            "Create study guides and summaries",
            "Research and analyze topics",
            "Practice problem-solving",
            "Learn new skills step-by-step"
        ],
        Code: [
            "Build web applications",
            "Debug and optimize code",
            "Learn programming languages",
            "Create algorithms and data structures",
            "Review and refactor code"
        ],
        "Life stuff": [
            "Plan and organize daily tasks",
            "Improve personal relationships",
            "Develop healthy habits",
            "Make important decisions",
            "Practice mindfulness and wellness"
        ]
    }

    const sectionIcons = {
        Write: PenTool,
        Learn: GraduationCap,
        Code: Code,
        "Life stuff": Heart
    }

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }


    const greeting = `${getTimeBasedGreeting()}, ${username ?? "there"}`


    const handleSectionClick = (section: string) => {
        setActiveSection(activeSection === section ? null : section)
    }

    const handleMenuItemClick = (item: string) => {
       if(activeSection){
           setSelectedItem(item,activeSection)
           setActiveSection(null)

       }
    }


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const isButtonClick = Object.values(buttonRefs.current).some(ref =>
                ref?.contains(target)
            )

            if (menuRef.current && !menuRef.current.contains(target) && !isButtonClick) {
                setActiveSection(null)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveSection(null)
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [])

    return (
        <div className="pt-44">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-medium text-neutral-100">{greeting}</h1>

            </div>

            <div className="max-w-4xl w-[700px] mx-auto">


                <div className="flex justify-center items-center gap-4 p-2 bg-neutral-800 rounded-lg border border-neutral-700">

                    {Object.entries(sectionIcons).map(([section, Icon]) => (

                        <Button
                            key={section}

                            ref={(el) => {
                                buttonRefs.current[section] = el;
                            }}
                            variant="ghost"
                            className={`flex items-center gap-2 px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-700 border border-neutral-600 rounded-md transition-all duration-200 ${
                                activeSection === section ? "bg-neutral-700 text-white" : ""
                            }`}
                            onClick={() => handleSectionClick(section)}
                        >
                            <Icon className="w-4 h-4" />
                            {section}
                        </Button>
                    ))}
                </div>

                {/* Dropdown Menu */}
                {activeSection && (
                    <div className="flex justify-center mt-6">
                        <div
                            ref={menuRef}
                            className="w-[420px] bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300"
                        >
                            <div className="relative p-4">
                                {/* Close Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-3 right-3 w-6 h-6 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-sm"
                                    onClick={() => setActiveSection(null)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>

                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-4">
                                    {(() => {
                                        const Icon = sectionIcons[activeSection as keyof typeof sectionIcons]
                                        return <Icon className="w-4 h-4 text-neutral-400" />
                                    })()}
                                    <span className="text-neutral-300 font-medium">{activeSection}</span>
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-1">
                                    {menuData[activeSection as keyof typeof menuData]?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between px-3 py-3 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-md cursor-pointer transition-all duration-150"
                                            onClick={() => handleMenuItemClick(item)}
                                        >
                                            <span className="text-sm pr-2">{item}</span>
                                            <ChevronRight className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}