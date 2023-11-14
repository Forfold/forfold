import React, { useState, useEffect } from 'react'

interface GithubProfileProps {
    username: string
}

type GithubProfile = {
    name: string
    bio: string
    followers: string
    following: string
    public_repos: string
}

export default function GitHubProfile ({ username }: GithubProfileProps) {
    const [userData, setUserData] = useState<GithubProfile | null>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`https://api.github.com/users/${username}`)
                const data = await response.json()
                setUserData(data)
            } catch (error) {
                console.error('Error fetching GitHub data:', error)
            }
        }

        fetchUserData()
    }, [username])

    if (!userData) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h3>{userData.name}</h3>
            <h4><a href="https://github.com/Forfold" style={{ color: 'white' }}>github.com/Forfold</a></h4>
            <p>{userData.bio}</p>
            <p>Followers: {userData.followers}</p>
            <p>Following: {userData.following}</p>
            <p>Public Repos: {userData.public_repos}</p>
            <br />
            <p>More coming soon...</p>
        </div>
    )
}
