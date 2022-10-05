pipeline {
  agent any
  environment {
    REGISTRY_HOST = credentials('docker-registry-host')
    REGISTRY_HOST_REMOTE = credentials('docker-registry-domain')
    JENKINS_SERVER = credentials('jenkins-server')
    GIT_REPO_NAME = env.GIT_URL.replaceFirst(/^.*\/([^\/]+?).git$/, '$1').toLowerCase().trim()
    SLACK_CHANNEL = 'C042KE1SV0A'
  }

  stages {
    stage ('Check build') {
      when { changeRequest() }

      steps {
        build_pr('unistory-node', 16)
      }
    }

    stage('Build') {
      parallel {
        stage('Prod') {
          when {
            allOf {
              not {
                changeRequest()
              }
              anyOf {
                branch 'main'
                branch 'master'
              }
            }
          }

          environment {
            DB = credentials('BACKEND_DB')
          }

          steps {
            sh '''
              sed -i \
                -e s/^DB_USER=.*/DB_USER=$DB_USR/ \
                -e s/^DB_PASS=.*/DB_PASS=$DB_PSW/ \
                .production.env
            '''
            build_image()
            notify_slack('Production build success')
          }
        }

        stage('Dev') {
          when {
            allOf {
              not {
                changeRequest()
              }
              anyOf {
                branch 'dev'
                branch 'development'
              }
            }
          }

          steps {
            build_image()
          }
        }
      }
    }

    stage('Start') {
      parallel {
        stage('Prod') {
          when {
            allOf {
              not {
                changeRequest()
              }
              anyOf {
                branch 'master'
                branch 'main'
              }
            }
          }

          stages {
            stage('Approve') {
              input {
                message 'Deploy this build?'
                ok 'Yes'
                submitter ', alukashenko, nbobkov'
              }

              environment {
                LOKI = credentials('LOKI')
                DOCKER = credentials('DOCKER')
                PGADMIN = credentials('PGADMIN')
                SSH_PROFILE = ''
                COMPOSE_PROJECT_NAME = 'frenly'
                FOLDER = 'backend'
                DOMAIN = ''
                PRODUCTION_URL = ''
              }

              steps {
                sh '''
                  ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $SSH_PROFILE bash -c "'
                    mkdir -p $FOLDER
                  '"

                  scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no docker-compose.prod.yml $SSH_PROFILE:$FOLDER
                  scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no .production.env $SSH_PROFILE:$FOLDER

                  ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $SSH_PROFILE \
                    bash -c "'
                      cd $FOLDER
                      echo GIT_REPO_NAME=$GIT_REPO_NAME >> .production.env
                      echo REGISTRY_HOST_REMOTE=$REGISTRY_HOST_REMOTE >> .production.env
                      echo BRANCH_NAME=$BRANCH_NAME >> .production.env
                      echo COMPOSE_PROJECT_NAME=$COMPOSE_PROJECT_NAME >> .production.env
                      echo LOKI_USR=$LOKI_USR >> .production.env
                      echo LOKI_PSW=$LOKI_PSW >> .production.env
                      echo PGADMIN_USR=$PGADMIN_USR >> .production.env
                      echo PGADMIN_PSW=$PGADMIN_PSW >> .production.env
                      echo DOMAIN=$DOMAIN >> .production.env
                      echo $DOCKER_PSW > .docker_password
                      cat .docker_password | docker login $REGISTRY_HOST_REMOTE -u $DOCKER_USR --password-stdin
                      docker compose -f docker-compose.prod.yml --env-file .production.env pull
                      docker compose -f docker-compose.prod.yml --env-file .production.env up -d
                    '"

                  git restore .production.env
                '''
                notify_slack("Production deployment success")
              }
            }
          }
        }

        stage('Dev') {
          when {
            allOf {
              not {
                changeRequest()
              }
              anyOf {
                branch 'development'
                branch 'dev'
              }
            }
          }

          environment {
            COMPOSE_PROJECT_NAME = 'frenly'
            ENV_FILE = '.development.env'
          }

          steps {
            script {
              def IMAGE_EXPOSED_PORT = 3000
              def GIT_REPO_NAME = env.GIT_URL.replaceFirst(/^.*\/([^\/]+?).git$/, '$1').toLowerCase()
              sh """
                echo REGISTRY_HOST=${REGISTRY_HOST} >> ${ENV_FILE}
                echo GIT_REPO_NAME=${GIT_REPO_NAME} >> ${ENV_FILE}
                echo BRANCH_NAME=${BRANCH_NAME} >> ${ENV_FILE}
                docker-compose --env-file ${ENV_FILE} up -d
              """
            }
            notify_slack("Traefik backend startup success", "/rest")
          }
        }
      }
    }
  }

  post {
    failure {
      script {
        if (
          env.BRANCH_NAME == "development" ||
          env.BRANCH_NAME == "dev" ||
          env.BRANCH_NAME == "master" ||
          env.BRANCH_NAME == "main"
        ) {
          notify_slack('Build failure')
        }
      }
    }
  }
}
