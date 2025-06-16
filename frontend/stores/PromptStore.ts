import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface MenuState {
    selectedItem: string | null
    selectedSection: string | null
    history: Array<{ item: string; section: string; timestamp: Date }>

    // Actions
    setSelectedItem: (item: string, section: string) => void
    clearSelection: () => void
    getLastSelected: () => { item: string; section: string } | null
    getHistoryBySection: (section: string) => Array<{ item: string; timestamp: Date }>
}

export const useMenuStore = create<MenuState>()(
    devtools(
        (set, get) => ({
            selectedItem: null,
            selectedSection: null,
            history: [],

            setSelectedItem: (item: string, section: string) => {
                set((state) => ({
                    selectedItem: item,
                    selectedSection: section,
                    history: [
                        ...state.history,
                        { item, section, timestamp: new Date() }
                    ].slice(-50) // Keep only last 50 items
                }))
            },

            clearSelection: () => {
                set({ selectedItem: null, selectedSection: null })
            },

            getLastSelected: () => {
                const { history } = get()
                return history.length > 0
                    ? { item: history[history.length - 1].item, section: history[history.length - 1].section }
                    : null
            },

            getHistoryBySection: (section: string) => {
                const { history } = get()
                return history
                    .filter(entry => entry.section === section)
                    .map(({ item, timestamp }) => ({ item, timestamp }))
            }
        }),
        { name: 'menu-store' }
    )
)

export const useSelectedItem = () => useMenuStore(state => state.selectedItem)
export const useSelectedSection = () => useMenuStore(state => state.selectedSection)
export const useMenuHistory = () => useMenuStore(state => state.history)