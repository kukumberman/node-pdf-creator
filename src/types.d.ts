export type Config = {
  output: string
  profile: Profile
  avatar: Avatar
  fonts: {
    [key: string]: Font
  }
  sections: Section[]
}

export type Profile = {
  links: string[]
}

export type Avatar = {
  src: string
  type: string | "circle"
  radius: number
}

export type Font = {
  name: string
  src: string
}

export type Section = {
  header: string
  description?: string
  projects: Project[]
}

export type Project = {
  name: string
  links: string[]
}
