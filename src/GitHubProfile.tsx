import { Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import React, { useState, useEffect } from 'react'
import JSONPretty from 'react-json-pretty'

type GithubProfile = {
  name: string;
  bio: string;
  followers: string;
  following: string;
  public_repos: string;
}

type GitHubEvent = {
  id: string
  type: string
}

const username = 'Forfold'

export default function GitHubProfile() {
  const [userData, setUserData] = useState<GithubProfile | null>(null)
  const [eventsData, setEventsData] = useState<GitHubEvent[] | null>(null)

  async function _fetch(url: string, type: 'user' | 'events') {
    try {
      const response = await fetch(url)
      const data = await response.json()
      if (type === 'user') setUserData(data)
      if (type === 'events') setEventsData(data)
    } catch (error) {
      console.error('Error fetching GitHub data:', error)
    }
  }

  useEffect(() => {
    // main user data
    _fetch(`https://api.github.com/users/${username}`, 'user')
    _fetch(`https://api.github.com/users/${username}/events`, 'events')
  }, [username])

  if (!userData) {
    return <div>Loading...</div>
  }

  function splitStringByCapital(inputString: string) {
    const result = [inputString[0]]  // Start with the first character

    for (let i = 1; i < inputString.length; i++) {
      const char = inputString[i]
      if (char === char.toUpperCase()) {
        result.push(' ')  // Add a space before the capital letter
      }
      result.push(char)
    }

    return result.join('')
  }

  return (
    <div>
      <h3>
        <a href="https://github.com/Forfold" style={{ color: 'white' }}>
          github.com/Forfold
        </a>
      </h3>
      <p>{userData.bio}</p>
      <p>Followers: {userData.followers}{' // '}Following: {userData.following}</p>
      <p>Here&apos;s some of my recent activity!</p>
      {eventsData && eventsData.map((event) => (
        <Accordion key={event.id} sx={{ maxWidth: '800px' }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{splitStringByCapital(event.type).replace(' Event', '')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>
              <JSONPretty
                theme={{
                  main: 'line-height:1.3;color:#66d9ef;overflow:auto;',
                  error: 'line-height:1.3;color:#66d9ef;overflow:auto;',
                  key: 'color:#5484d1;',
                  string: 'color:#8eb3ed;',
                  value: 'color:#ac81fe;',
                  boolean: 'color:#ac81fe;',
                }}
                style={{ margin: '8px' }}
                data={event}
              />
            </pre>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}
