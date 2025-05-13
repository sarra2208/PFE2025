export interface UserProfile {
    id?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    token?: string;
    roles?: string[];  
    role: string;
    img?: string;
    emailVerified?: boolean;
    clintId?: string;
    // attributes?: { 
    //   [key: string]: string[] 
    // };
  }
  