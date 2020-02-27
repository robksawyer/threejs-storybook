import React, { useState, useRef, memo, useContext, useMemo, useEffect } from 'react'
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//@ts-ignore
import { useSpring, a } from 'react-spring/three'
import * as THREE from 'three'

extend({ OrbitControls })

const getPos = (ref: any): vector =>
  (ref.current ? Object.values(ref.current?.object.position) : [0, 2, 5]) as vector

const arrayComparator = (a: any[], b: any) => {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

type vector = [number, number, number]

interface CtxModel {
  active: vector
  setActive: React.Dispatch<React.SetStateAction<vector>>
}

const CtrContext = React.createContext<CtxModel>({
  active: [0, 0, 0],
  setActive: () => {},
})

const Controls = () => {
  const { camera, gl } = useThree()
  const ref = useRef<any>()

  useFrame(() => {
    if (!ref.current.enabled) {
      ref.current.object.position.set(...anim2.xyz.getValue())
      ref.current.target = new THREE.Vector3(...anim.xyz.getValue())

      ref.current.update()
    }
  })

  const { active } = useContext(CtrContext)

  const [anim, set] = useSpring(() => ({
    xyz: [active[0], 0.5, active[2]],
    config: {
      clamp: true,
      mass: 5,
    },
    onStart: () => {
      if (ref.current) {
        ref.current.enabled = false
      }
    },
    onRest: () => {
      ref.current.enabled = true
    },
  }))

  useEffect(() => {
    set({ xyz: [active[0], 0.5, active[2]] })
  }, [active, set])

  const oldCameraPos = getPos(ref)

  const anim2 = useSpring({
    config: {
      clamp: true,
      mass: 5,
    },
    from: {
      xyz: oldCameraPos,
    },
    to: [
      {
        xyz: oldCameraPos,
        immediate: true,
      },
      {
        xyz: [active[0], 2, 5],
        immediate: false,
      },
    ],
  })

  return (
    //@ts-ignore
    <orbitControls
      args={[camera, gl.domElement]}
      maxPolarAngle={(Math.PI * 35) / 80}
      minPolarAngle={0}
      ref={ref}
    />
  )
}

interface BoxProps {
  position: vector
  size: vector
}

const Box = memo((props: BoxProps) => {
  const { position, size } = props

  const { setActive } = useContext(CtrContext)

  const pos = useMemo<vector>(() => [position[0], size[1] / 2, position[2]], [position, size])

  const pointerRef = useRef(false)

  const onClick = (evt: any) => {
    evt.stopPropagation()
    if (pointerRef.current) {
      pointerRef.current = false
      setActive((prev) => (arrayComparator(prev, pos) ? prev : pos))
    }
  }

  const { scale, color } = useSpring({
    scale: [1, 1, 1],
    color: 'grey',
  })

  const onPointerOver = (evt: any) => {
    evt.stopPropagation()
  }

  const onPointerOut = (evt: any) => {
    evt.stopPropagation()
    pointerRef.current = false
  }

  return (
    <a.mesh
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerUp={onClick}
      onPointerDown={() => (pointerRef.current = true)}
      scale={scale}
      position={pos}
      castShadow
    >
      <boxBufferGeometry attach='geometry' args={size} />
      <a.meshLambertMaterial attach='material' color={color} />
    </a.mesh>
  )
})

export default () => {
  const [active, setActive] = useState<vector>([0, 0, 0])

  return (
    <Canvas camera={{ position: [0, 2, 5] }} shadowMap>
      <CtrContext.Provider value={{ active, setActive }}>
        <Controls />
        <ambientLight />
        {/* <spotLight position={[5, 5, 5]} intensity={0.5} /> */}
        <spotLight position={[0, 5, 5]} intensity={0.5} castShadow />
        <Box position={[-4, 0, 0]} size={[1, 1, 1]} />
        <Box position={[0, 0, 0]} size={[1, 1, 1]} />
        <Box position={[4, 0, 0]} size={[1, 1, 1]} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeBufferGeometry attach='geometry' args={[100, 100]} />
          <meshPhysicalMaterial attach='material' color='rgba(100,150, 100, 0.5)' />
        </mesh>
      </CtrContext.Provider>
    </Canvas>
  )
}