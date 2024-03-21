import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import NavigationSidebar from "./navigation/NavigationSidebar"
import ServerSidebar from "./server/ServerSidebar"

const MobileToggle = ({serverId}:{serverId: string}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="md:hidden mx-2" variant="ghost" size="icon">
          <Menu className=""/>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSidebar/>
        </div>
        <ServerSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  )
}

export default MobileToggle