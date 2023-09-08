import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import FailureView from '../FailureView'
import ProjectItem from '../ProjectItem'

import './index.css'

const categoriesList = [
  {id: 'ALL', displayText: 'All'},
  {id: 'STATIC', displayText: 'Static'},
  {id: 'RESPONSIVE', displayText: 'Responsive'},
  {id: 'DYNAMIC', displayText: 'Dynamic'},
  {id: 'REACT', displayText: 'React'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class Home extends Component {
  state = {
    activeProjectType: categoriesList[0].id,
    apiStatus: apiStatusConstants.initial,
    projectsList: [],
  }

  componentDidMount() {
    this.getProjects()
  }

  onRetry = () => {
    this.setState({apiStatus: apiStatusConstants.initial}, this.getProjects)
  }

  getProjects = async () => {
    const {activeProjectType} = this.state

    this.setState({apiStatus: apiStatusConstants.inProgress})

    const getProjectsApiUrl = `https://apis.ccbp.in/ps/projects?category=${activeProjectType}`
    const options = {
      method: 'GET',
    }

    const response = await fetch(getProjectsApiUrl, options)
    if (response.ok === true) {
      const projectsResponse = await response.json()
      const formattedProjectsResponse = projectsResponse.projects.map(
        eachProject => ({
          id: eachProject.id,
          imageUrl: eachProject.image_url,
          name: eachProject.name,
        }),
      )
      this.setState({
        projectsList: formattedProjectsResponse,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onChangeProjectType = event => {
    this.setState({activeProjectType: event.target.value}, this.getProjects)
  }

  renderLoader = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" height={50} width={50} color="#328af2" />
    </div>
  )

  renderProjects = () => {
    const {projectsList} = this.state

    return (
      <ul className="projects-list-container">
        {projectsList.map(eachProject => (
          <ProjectItem key={eachProject.id} projectDetails={eachProject} />
        ))}
      </ul>
    )
  }

  renderFailureView = () => <FailureView onRetry={this.onRetry} />

  renderApiResults = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderProjects()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    const {activeProjectType} = this.state

    return (
      <div className="main-container">
        <Header />
        <div className="projects-main-container">
          <select
            id="dropdown"
            value={activeProjectType}
            onChange={this.onChangeProjectType}
            className="dropdown-input"
          >
            {categoriesList.map(eachCategory => (
              <option
                key={eachCategory.id}
                value={eachCategory.id}
                className="option-name"
              >
                {eachCategory.displayText}
              </option>
            ))}
          </select>
          <div className="projects-container">{this.renderApiResults()}</div>
        </div>
      </div>
    )
  }
}

export default Home
