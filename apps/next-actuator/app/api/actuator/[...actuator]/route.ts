import { createNextActuator, type Component } from 'next-actuator'
import propertiesReader from 'properties-reader'
import { name, version, description, author } from '@/package.json'
import { join } from 'node:path'

const internal: Component = {
  status: async () => fetch('http://localhost:3000/api/actuator/info')
    .then(res => res.json())
    .then(res => res.application.name === 'next-actuator-app'),
  details: {
    description: 'Dog-fooding our own implementation'
  }
}

const external: Component = {
  status: async () => 404,
  details: {
    description: 'Burning the whole house down'
  }
}

const getGitInfo = async () => {
  const gitInfo = propertiesReader(join(process.cwd(), 'git.properties'))
  return {
    time: gitInfo.get('git.commit.time'),
    branch: gitInfo.get('git.branch'),
    id: {
      full: gitInfo.getRaw('git.commit.id'),
      short: gitInfo.getRaw('git.commit.id.abbrev')
    },
    message: {
      full: gitInfo.get('git.commit.message.full'),
      short: gitInfo.get('git.commit.message.short')
    },
    author: {
      email: gitInfo.get('git.commit.user.email'),
      name: gitInfo.get('git.commit.user.name')
    }
  }
}

const { GET } = createNextActuator({
  components: {
    internal,
    external
  },
  info: async () => ({
    application: {
      name,
      version,
      description,
      author
    },
    git: await getGitInfo()
  })
})

export { GET }
