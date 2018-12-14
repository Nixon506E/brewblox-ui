import flatten from 'lodash/flatten';

const rotated = (rotation: number) => rotation % 360;

const rotatedFlows = (flows: ProcessViewPartFlows, rotation: number = 0): ProcessViewPartFlows =>
  Object.keys(flows)
    .reduce(
      (acc, angle) => ({
        ...acc,
        [rotated(parseInt(angle, 10) + rotation)]:
          flows[parseInt(angle, 10)].map(flowAngle =>
            ({ ...flowAngle, out: rotated(flowAngle.out + rotation) })),
      }),
      {},
    );

const getSources = (parts: ProcessViewPartWithComponent[]) => parts.filter(part => part.component.isSource);

const liquidIn = (part: ProcessViewPartWithComponent, provided: number): number =>
  (part.component.isSource
    ? parseInt(Object.keys(part.component.flows(part))[0], 10)
    : provided);

const xyAtAngle = (part: ProcessViewPartWithComponent, angle: number): { x: number, y: number } => {
  if (angle === 90) {
    return {
      x: part.x + 1,
      y: part.y,
    };
  }

  if (angle === 180) {
    return {
      x: part.x,
      y: part.y + 1,
    };
  }

  if (angle === 270) {
    return {
      x: part.x - 1,
      y: part.y,
    };
  }

  return {
    x: part.x,
    y: part.y - 1,
  };
};

const partAtAngle = (
  origin: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angle: number,
): ProcessViewPartWithComponent | undefined => {
  const { x, y } = xyAtAngle(origin, angle);
  return allParts
    .filter(part => part.x === x && part.y === y)
    .find((part: ProcessViewPartWithComponent) => {
      const flows = rotatedFlows(part.component.flows(part), part.rotate);
      return !!flows[rotated(angle + (part.component.isSource ? 0 : 180))];
    });
};

export const isSamePart = (
  left: ProcessViewPartWithComponent | ProcessViewPart,
  right: ProcessViewPartWithComponent | ProcessViewPart,
) => (left.x === right.x
  && left.y === right.y
  && left.type === right.type
  && left.rotate === right.rotate);

const addFlowToPart = (
  part: ProcessViewPartWithComponent,
  flowToAdd: ProcessViewPartCalculatedFlow,
  allParts: ProcessViewPartWithComponent[],
): ProcessViewPartWithComponent[] =>
  allParts
    .map((item) => {
      if (!isSamePart(part, item)) {
        return item;
      }

      return {
        ...part,
        flow: {
          ...part.flow,
          ...item.flow,
          ...Object.keys(flowToAdd)
            .reduce(
              (acc, key) => {
                const angle = parseInt(key, 10);
                return {
                  ...acc,
                  [angle]: flowToAdd[angle] + (item.flow && item.flow[angle] ? item.flow[angle] : 0),
                };
              },
              {},
            ),
        },
      };
    });

const possibleOutputs = (
  part: ProcessViewPartWithComponent,
  angleIn: number,
): ProcessViewPartFlow[] => {
  const flowFrom = liquidIn(part, angleIn);
  const flows = rotatedFlows(part.component.flows(part), part.rotate);
  return flows[flowFrom] || [];
};

const flow = (
  part: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angleIn: number = 0,
  accFriction: number = 0,
  startPressure: number = 10,
  candidates: ProcessViewPartWithComponent[] = allParts,
): ProcessViewPartWithComponent[] => {
  const candidateParts = [...candidates.filter(candidate => !isSamePart(part, candidate))];

  return possibleOutputs(part, angleIn)
    .reduce(
      (parts, output) => {
        const angle = output.out;
        const totalFriction = accFriction + (output.friction || 0);

        if (typeof output.pressure === 'number') {
          if (output.pressure < startPressure) {
            const pathFlow = (startPressure - output.pressure) / totalFriction;
            return addFlowToPart(
              part,
              {
                [angle]: pathFlow,
                [angleIn]: pathFlow * -1,
              },
              parts,
            );
          }
          return parts;
        }

        const nextPart = partAtAngle(part, candidateParts, angle);

        if (!nextPart) {
          // no flow possible
          return addFlowToPart(
            part,
            {
              [angle]: 0,
              [angleIn]: 0,
            },
            parts,
          );
        }

        const notUpdatedNextPart = partAtAngle(part, parts, angle);

        const nextFlows = flow(
          nextPart,
          parts,
          rotated(angle + 180),
          totalFriction,
          startPressure,
          candidateParts,
        );

        const updatedNextPart = partAtAngle(part, nextFlows, angle);

        let additionalAngleFlow = 0;
        if (updatedNextPart && updatedNextPart.flow) {
          additionalAngleFlow += updatedNextPart.flow[rotated(angle + 180)];
        }
        if (notUpdatedNextPart && notUpdatedNextPart.flow) {
          additionalAngleFlow -= notUpdatedNextPart.flow[rotated(angle + 180)];
        }

        return addFlowToPart(
          part,
          {
            [angle]: additionalAngleFlow * -1,
            [angleIn]: additionalAngleFlow,
          },
          nextFlows,
        );
      },
      allParts,
    );
};

const mergeSourceFlows = (
  acc: ProcessViewPartWithComponent[],
  sourceFlow: ProcessViewPartWithComponent[],
): ProcessViewPartWithComponent[] =>
  flatten([acc, sourceFlow]);

const angledFlow = (part: ProcessViewPartWithComponent): ProcessViewPartCalculatedFlow =>
  Object.keys(part.flow || {})
    .map(angle => parseInt(angle, 10))
    .reduce(
      (acc, angle) => (
        // rotate flow to match Vue component (anti-rotate)
        part.flow
          ? { ...acc, [rotated(angle + (360 - (part.rotate || 0)))]: part.flow[angle] }
          : acc
      ),
      {},
    );

export const pathsFromSources = (parts: ProcessViewPartWithComponent[]): ProcessViewPartWithComponent[] =>
  getSources(parts)
    .map(source => flow(source, parts)) // Part[][]
    .reduce(mergeSourceFlows, []) // Part[]
    .map(part => (part.flow ? { ...part, flow: angledFlow(part) } : part));
