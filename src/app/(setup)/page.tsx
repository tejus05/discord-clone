import prisma from '@/db';
import { initialProfile } from '@/lib/initialProfile';
import { redirect } from 'next/navigation';

const SetUpPage = async () => {

  const profile = await initialProfile();

  const server = await prisma.server.findFirst({
    where: {
      members: {
        some: { //used in one-to-many or many-to-many relationships
          profileId: profile.id
        }
      }
    }
  })

  if (server) {
    return redirect(`/servers/${server.id}`)
  }

  return (
    <div>SetUpPage</div>
  )
}

export default SetUpPage