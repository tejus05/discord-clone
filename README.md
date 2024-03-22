# Discord Clone

## Description
This project is a Discord clone built using Next.js 14 (app router), TypeScript, Pusher, CockroachDB, Livekit and several libraries to replicate the functionalities of the popular communication platform Discord.

## Technologies Used
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Pusher](https://pusher.com/)
- [Livekit](https://livekit.io/)
- [Emoji Mart](https://github.com/missive/emoji-mart)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/)
- [React Dropzone](https://react-dropzone.js.org/)
- [React Hot Toast](https://react-hot-toast.com/)
- [UploadThing](https://uploadthing.com/)

## Features

### Server Management
- **Join Different Servers**: Users can join different servers using a unique invite link for each server.
- **Channel Creation and Deletion**: Admins and moderators have the privilege to create and delete channels within the server.
- **Default Channel**: A default "General" text channel exists in each server by default and cannot be mutated.
- **Customized Server Avatar**: Admins have the ability to set a customized avatar for the server, adding a personal touch to the community.

### User Roles and Permissions
- **Role Management**: Admins have the authority to change roles of users within the server.
- **Admin Restrictions**: An admin cannot change their own role to prevent accidental loss of administrative privileges.

### Real-time Communication
- **Text Channels**: Users can communicate in real-time through text messages in channels.
- **Direct Conversations**: Users can engage in private one-to-one text conversations with each other in real-time.
- **File Attachments**: Users can send attachments such as PDFs and images in text channels and direct conversations.

### Multimedia Communication
- **Group Voice and Video Chat**: Group members can participate in real-time voice and video chats within the server.
- **One-to-One Video Chat**: Users can initiate one-to-one video calls separately with other members.

### Server Administration
- **Server Deletion**: Admins have the capability to delete servers.

### Testing Server
- **Test Server**: Users can join the test server for testing purposes using the provided invite link: [Test Server Invite](https://discord-clone-chat-app.vercel.app/invite/3932c48b-e325-48c4-9479-5a7166200ace)

## Live Demo
A live demo of this Discord clone is available [here](https://discord-clone-chat-app.vercel.app/)

## Installation
To run this project locally, follow these steps:
1. Clone the repository: `git clone https://github.com/tejus05/discord-clone.git`
2. Navigate to the project directory: `cd discord-clone`
3. Create a `.env` file in the root directory of the project.
4. Add the following environment variables to the `.env` file:
   ```plaintext
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   DATABASE_URL="your_database_connection_url_here"
   UPLOADTHING_SECRET=your_uploadthing_secret_here
   UPLOADTHING_APP_ID=your_uploadthing_app_id_here
   PUSHER_APP_ID="your_pusher_app_id_here"
   NEXT_PUBLIC_PUSHER_APP_KEY="your_pusher_app_key_here"
   PUSHER_APP_SECRET="your_pusher_app_secret_here"
   LIVEKIT_API_KEY=your_livekit_api_key_here
   LIVEKIT_API_SECRET=your_livekit_api_secret_here
   NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url_here
   ```
   Replace `your_clerk_publishable_key_here`, `your_clerk_secret_key_here`, and other placeholder values with your actual credentials.
5. Install dependencies: `npm install`
6. Start the development server: `npm run dev`
7. Open your browser and visit `http://localhost:3000`

## Usage
Once the development server is running, you can start using the Discord clone. Navigate through different servers, channels, send messages, and explore the functionalities.

## Contributing
Contributions are welcome! If you'd like to contribute to this project, feel free to submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](https://choosealicense.com/licenses/mit/) file for details.
