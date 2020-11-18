import { Action, payload } from "./action-creator";

describe("action-creator", () => {
  describe("Action", () => {
    const testType = "test_action_name";

    it("should return an action creator that creates an object with property 'type'", () => {
      const ac1 = Action(testType);
      expect(ac1().type).toEqual(testType);

      const ac2 = Action(testType, payload<{ enabled: boolean }>());
      expect(ac2({ enabled: false }).type).toEqual(testType);
    });

    it(
      [
        "should return an action creator that includes the correct payload",
        "given the second payload factory argument",
      ].join(" "),
      () => {
        const actionCreator = Action(testType, payload<{ status: boolean }>());
        const samplePayload = { status: true };

        expect(actionCreator(samplePayload)).toEqual({
          type: testType,
          payload: samplePayload,
        });
      }
    );
  });
});
