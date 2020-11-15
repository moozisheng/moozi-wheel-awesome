module.exports = createHistory = () => {
    const timeline = {};
    timeline.past = [];
    timeline.present = undefined;
    timeline.future = [];

    timeline.gotoState = (index) => {
        const allState = [...timeline.past, timeline.present, ...timeline.future];
        timeline.present = allState(index);
        timeline.past = allState.slice(0, index);
        timeline.future = allState.slice(index + 1, allState.length);
    }

    timeline.getIndex = () => {
        return timeline.past.length;
    }

    timeline.push = (currentState) => {
        if (timeline.present) {
            timeline.past.push(timeline.present);
        }
        timeline.present = currentState;
    }

    timeline.undo = () => {
        if (timeline.past.length !==0) {
            timeline.gotoState(timeline.getIndex() - 1);
        }
    }

    timeline.redo = () => {
        if (timeline.future.length !== 0) {
            timeline.gotoState(timeline.getIndex() + 1);
        }
    }

    return timeline

}