import React, { useState, useEffect, useContext } from 'react';
import { MyPokemonContext } from '../Context/MyPokemonContext';
import { fetchData } from '../utils'
import styled from '@emotion/styled'

import List from '../components/List'
import TypeList from '../components/TypeList'
import ModalCatchPokemon from '../components/ModalCatchPokemon';
import Loading from '../components/Loading';
import Button from '../components/Button';
import ResponsiveImg from '../components/ResponsiveImg';
import StatusBar from '../components/StatusBar';

import { mq } from '../assets/styling/breakpoints'
import { color } from '../constants/style';



const PokemonDetailWrapper = styled.div`
  .content-wrap {
    padding: 0 16px;
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
  }
  .content-left, .content-right {
    width: 100%;
  }
  
  .image-wrapper {
    max-width: 200px;
    max-height:200px;
    margin-bottom: 3rem;
  }

  .more-info {
    display: flex;
    justify-content: space-between;
  }

  ${mq('s')} {
    .content-wrap {
      flex-flow: row nowrap;
      justify-content: space-between;
    }
    .content-left {
      width: 30%;
    }
    .content-right {
      width: 68%;
    }
  }
`
const Wrapper = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 24px;
`

const PokemonDetail = ({ match }) => {
  const [pokemon, setPokemon] = useState({});
  const [capturedPokemons, setCapturedPokemons] = useContext(MyPokemonContext)
  const [isCaptured, setIsCaptured] = useState(false)
  const [moves, setMoves] = useState([])
  const [abilities, setAbilities] = useState([])
  const [myPokemonByName, setMyPokemonByName] = useState([])
  
  const [modalIsActive, setModalIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getDetail();
    setMyPokemonByName(() => capturedPokemons.filter(captPokemon => captPokemon.name === match.params.pokemonName))
  }, [])
  
  const getDetail = async () => {
    const response = await fetchData(`pokemon/${match.params.pokemonName}`);
    const json = await response.json()
    setPokemon(json)
    setMoves(() => {return json.moves.map(e => e.move)})
    setAbilities(() => {return json.abilities.map(e => e.ability)})
  }

  const catchPokemon = (pokemon) => {
    setIsLoading(true)

    setTimeout(() => setIsLoading(false), 1000)
    setTimeout(() => setModalIsActive(true), 1000)
    // Random boolean with 50% success percentage
    setIsCaptured(Math.random() >= 0.5)
  }

  const saveCatchedPokemon = (nickname) => {
    setModalIsActive(false)

    setCapturedPokemons(prevList => {
      const tempNewArray = [...prevList, {...pokemon, nickname: nickname}]
      localStorage.setItem('capturedPokemons', JSON.stringify(tempNewArray))

      return tempNewArray
    })
  }
  
  return (
    <PokemonDetailWrapper className="pokemons-list">
      <h1 className="text-centered">Pokemon Details</h1>

      <div className="content-wrap">
        <div className="content-left">
          <Wrapper>
            <div className="image-wrapper mx-auto">
              <ResponsiveImg
                src={pokemon.sprites && pokemon.sprites.other.dream_world.front_default}
                alt={pokemon.name}
              />
            </div>

            <div>
              <h2 className="capitalize text-centered">{pokemon.name}</h2>
            </div>
            
            <div>
              <div className="more-info">
                <h4>Weight</h4>
                <p>{pokemon.weight} kg</p>
              </div>
              <div className="more-info">
                <h4>Height</h4>
                <p>{pokemon.height/10} m</p>
              </div>
              <div className="more-info">
                <h4>Base XP</h4>
                <p>{pokemon.base_experience}</p>
              </div>
            </div>

            <TypeList types={pokemon.types}></TypeList>
            <div className="my">
              <Button
                centered={true}
                width={`100%`}
                bgColor={color.blue}
                callbackFunc={ () => catchPokemon(pokemon)}
              >
                <h2 className="mx-0 my-0 text-white">Catch</h2>
              </Button>
            </div>
          </Wrapper>

          <Wrapper>
            <h2 className="capitalize">My {pokemon.name} ({myPokemonByName.length})</h2>

            {
              myPokemonByName.length > 0 ? (
                <List
                  data={myPokemonByName}
                  property="nickname"
                />
              ) : (
                <div>
                  <p>
                    No {pokemon.name} captured yet
                  </p>
                </div>
              )
            }
          </Wrapper>
        </div>

        <div className="content-right">
          <Wrapper>
            <h2>Abilities</h2>
            <List
              data={abilities}
              property="name"
            />
          </Wrapper>

          <Wrapper>
            <h2>Stats</h2>
            
            {
              pokemon.stats && pokemon.stats.map((stat, index) =>
                <StatusBar key={index} statName={stat.stat.name} points={stat.base_stat} />
              )
            }
          </Wrapper>

          <Wrapper>
            <h2>Moves</h2>
            <List
              data={moves}
              property="name"
            />
          </Wrapper>
        </div>
      </div>

      { isLoading && <Loading /> }

      {
        modalIsActive &&
          <ModalCatchPokemon
            closeModal={() => {
              setModalIsActive(false)
            }}
            saveCatchedPokemon={event => saveCatchedPokemon(event)}
            isCaptured={isCaptured}
            pokemon={pokemon}
            capturedPokemons={capturedPokemons}
          />
      }

    </PokemonDetailWrapper>
  )
}

export default PokemonDetail;
