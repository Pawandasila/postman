export interface UserProps {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: "ADMIN" | "USER";
    createdAt: Date;
    updatedAt: Date;
}